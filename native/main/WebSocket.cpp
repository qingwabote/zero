#include <thread>
#include <atomic>
#include "WebSocket.hpp"
#include "lws/libwebsockets.h"
#include "base/threading/SCSP.hpp"
#include <iterator>
#include "log.h"
#include <queue>
#include <regex>

// https://libwebsockets.org/lws-api-doc-main/html/md_READMEs_README_coding.html

namespace zero
{
    class WebSocketImpl
    {
    private:
        static int lws_callback(lws *wsi, enum lws_callback_reasons reason, void * /*user*/, void *in, size_t len)
        {
            auto ctx = lws_get_context(wsi);
            WebSocketImpl *user = static_cast<WebSocketImpl *>(lws_context_user(ctx));
            return user->lws_callback(wsi, reason, static_cast<uint8_t *>(in), len);
        }

        static const lws_protocols protocols[];

        lws_context *_context{nullptr};

        lws *_connection{nullptr};

        std::shared_ptr<std::vector<char>> _buffer{nullptr};

        std::string _data;

        std::queue<std::string> _messageQueue;

        int _readyState{-1};

    public:
        int readyState() { return _readyState; }

        WebSocketCallback onopen;
        WebSocketCallback onmessage;

        WebSocketImpl(const std::string &url)
        {
            std::smatch match;
            if (!std::regex_match(url, match, std::regex(R"(ws://(.*):(\d+))")))
            {
                ZERO_LOG_ERROR("WebSocket url match fails: %s", url.c_str());
                return;
            }

            std::string host = match[1].str();
            std::string port = match[2].str();

            lws_context_creation_info context_info{};
            context_info.protocols = protocols;
            context_info.user = this;
            if (host.length()) // client
            {
                context_info.port = CONTEXT_PORT_NO_LISTEN;
                _context = lws_create_context(&context_info);

                lws_client_connect_info connect_info{};
                connect_info.context = _context;
                connect_info.address = host.c_str();
                connect_info.port = std::stoi(port);
                connect_info.protocol = protocols[0].name;
                _connection = lws_client_connect_via_info(&connect_info);
                if (!_connection)
                {
                    lws_context_destroy(_context);
                    ZERO_LOG_ERROR("lws_client_connect_via_info fails");
                    return;
                }
            }
            else if (match[2].matched) // server
            {
                context_info.port = std::stoi(port);
                _context = lws_create_context(&context_info);
            }

            _readyState = 0;
        }

        int lws_callback(lws *wsi, enum lws_callback_reasons reason, uint8_t *in, size_t len)
        {
            switch (reason)
            {
            case LWS_CALLBACK_WSI_CREATE:
                _connection = wsi;
                break;
            case LWS_CALLBACK_CLOSED:
                ZERO_LOG_INFO("LWS_CALLBACK_CLOSED");
                break;
            case LWS_CALLBACK_WSI_DESTROY:
                _connection = nullptr;
                ZERO_LOG_INFO("LWS_CALLBACK_WSI_DESTROY");
                break;
            case LWS_CALLBACK_ESTABLISHED:
            case LWS_CALLBACK_CLIENT_ESTABLISHED:
                ZERO_LOG_INFO("LWS_CALLBACK_ESTABLISHED");
                if (onopen)
                {
                    onopen->call(std::make_unique<WebSocketEvent>());
                }
                lws_callback_on_writable(wsi);
                break;
            case LWS_CALLBACK_RECEIVE:
            case LWS_CALLBACK_CLIENT_RECEIVE:
            {
                // ZERO_LOG_INFO("LWS_CALLBACK_RECEIVE");
                bool binary = lws_frame_is_binary(wsi);
                auto remaining = lws_remaining_packet_payload(wsi);
                if (lws_is_first_fragment(wsi))
                {
                    auto size = len + remaining;
                    _data.reserve(size);
                }
                _data.append(reinterpret_cast<char *>(in), len);
                if (remaining == 0)
                {
                    if (onmessage)
                    {
                        ZERO_LOG_INFO("LWS_CALLBACK_RECEIVE %s", _data.c_str());
                        onmessage->call(std::make_unique<WebSocketEvent>(std::move(_data), binary));
                    }
                }
                break;
            }
            case LWS_CALLBACK_SERVER_WRITEABLE:
            case LWS_CALLBACK_CLIENT_WRITEABLE:
            {
                // ZERO_LOG_INFO("LWS_CALLBACK_SERVER_WRITEABLE");
                if (_messageQueue.empty())
                {
                    break;
                }

                static std::vector<unsigned char> buffer;
                buffer.resize(LWS_PRE);

                std::string message = std::move(_messageQueue.front());
                _messageQueue.pop();

                // ZERO_LOG_INFO("LWS_CALLBACK_SERVER_WRITEABLE %s", message.c_str());

                std::copy(message.begin(), message.end(), std::back_inserter(buffer));
                if (lws_write(wsi, buffer.data() + LWS_PRE, message.size(), LWS_WRITE_TEXT) < message.size())
                {
                    return -1;
                }

                if (_messageQueue.empty())
                {
                    break;
                }

                lws_callback_on_writable(wsi);
                break;
            }

            default:
                // ZERO_LOG_INFO("lws_callback_reasons: %d", reason);
                break;
            }
            return 0;
        }

        void send(std::string &&message)
        {
            _messageQueue.push(std::move(message));
            lws_callback_on_writable(_connection);
        }

        void service(int timeout_ms)
        {
            lws_service(_context, timeout_ms);
        }

        void cancel()
        {
            lws_cancel_service(_context);
        }

        ~WebSocketImpl()
        {
            lws_context_destroy(_context);
        }
    };

    const lws_protocols WebSocketImpl::protocols[] = {
        {"", WebSocketImpl::lws_callback, 0, 65536, 0, NULL, 0},
        LWS_PROTOCOL_LIST_TERM};

    int WebSocket::readyState()
    {
        return _impl->readyState();
    }

    WebSocket::WebSocket(const std::string &url) : _impl(new WebSocketImpl(url)) {}

    void WebSocket::onopen(WebSocketCallback &&callback)
    {
        _impl->onopen = std::move(callback);
    }

    void WebSocket::onmessage(WebSocketCallback &&callback)
    {
        _impl->onmessage = std::move(callback);
    }

    void WebSocket::send(std::string &&message)
    {
        _impl->send(std::move(message));
    }

    void WebSocket::service(int timeout_ms)
    {
        _impl->service(timeout_ms);
    }

    void WebSocket::cancel()
    {
        _impl->cancel();
    }

    WebSocket::~WebSocket() {}
}
