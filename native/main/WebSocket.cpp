#include <thread>
#include <atomic>
#include "WebSocket.hpp"
#include "lws/libwebsockets.h"
#include "base/threading/SCSP.hpp"
#include <iterator>
#include "log.h"
#include <queue>

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

        WebSocketCallback _onopen;
        WebSocketCallback _onmessage;

        std::queue<std::string> _messageQueue;

    public:
        WebSocketImpl(const std::string &url)
        {
            auto port = url.substr(url.rfind(":") + 1);

            lws_context_creation_info info{};
            info.port = std::stoi(port);
            info.protocols = protocols;
            info.user = this;
            _context = lws_create_context(&info);
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
                ZERO_LOG_INFO("LWS_CALLBACK_ESTABLISHED");
                if (_onopen)
                {
                    _onopen->call(std::make_unique<WebSocketEvent>());
                }
                lws_callback_on_writable(wsi);
                break;
            case LWS_CALLBACK_RECEIVE:
            {
                ZERO_LOG_INFO("LWS_CALLBACK_RECEIVE");
                bool binary = lws_frame_is_binary(wsi);
                auto remaining = lws_remaining_packet_payload(wsi);
                if (lws_is_first_fragment(wsi))
                {
                    ZERO_LOG_INFO("  first");

                    auto size = len + remaining;
                    _data.reserve(size);
                }
                ZERO_LOG_INFO("  insert");
                _data.append(reinterpret_cast<char *>(in), len);
                if (remaining == 0)
                {
                    if (_onmessage)
                    {
                        _onmessage->call(std::make_unique<WebSocketEvent>(std::move(_data), binary));
                    }
                }
                break;
            }
            case LWS_CALLBACK_SERVER_WRITEABLE:
            {
                if (_messageQueue.empty())
                {
                    break;
                }

                static std::vector<unsigned char> buffer;
                buffer.resize(LWS_PRE);

                std::string message = std::move(_messageQueue.front());
                _messageQueue.pop();

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
                ZERO_LOG_INFO("lws_callback_reasons: %d", reason);
                break;
            }
            return 0;
        }

        void onopen(WebSocketCallback callback)
        {
            _onopen = std::move(callback);
        }

        void onmessage(WebSocketCallback callback)
        {
            _onmessage = std::move(callback);
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

        ~WebSocketImpl()
        {
            lws_context_destroy(_context);
        }
    };

    const lws_protocols WebSocketImpl::protocols[] = {
        {"", WebSocketImpl::lws_callback, 0, 65536, 0, NULL, 0},
        LWS_PROTOCOL_LIST_TERM};

    WebSocket::WebSocket(const std::string &url) : _impl(new WebSocketImpl(url)) {}

    void WebSocket::onopen(WebSocketCallback callback)
    {
        _impl->onopen(std::move(callback));
    }

    void WebSocket::onmessage(WebSocketCallback callback)
    {
        _impl->onmessage(std::move(callback));
    }

    void WebSocket::send(std::string &&message)
    {
        _impl->send(std::move(message));
    }

    void WebSocket::service(int timeout_ms)
    {
        _impl->service(timeout_ms);
    }

    WebSocket::~WebSocket() {}
}
