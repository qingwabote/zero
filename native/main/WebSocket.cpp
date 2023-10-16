#include "WebSocket.hpp"
#include "lws/libwebsockets.h"

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

    std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> _onopen;
    std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> _onmessage;

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
        case LWS_CALLBACK_WSI_DESTROY:
            break;
        case LWS_CALLBACK_ESTABLISHED:
            if (_onopen)
            {
                _onopen->call(std::make_unique<WebSocketEvent>());
            }
            break;
        case LWS_CALLBACK_RECEIVE:
        {
            bool binary = lws_frame_is_binary(wsi);
            auto remaining = lws_remaining_packet_payload(wsi);
            if (lws_is_first_fragment(wsi))
            {
                auto size = len + remaining;
                _buffer = std::make_shared<std::vector<char>>();
                _buffer->reserve(binary ? size : size + 1);
            }
            _buffer->insert(_buffer->end(), in, in + len);
            if (remaining == 0)
            {
                if (!binary)
                {
                    _buffer->push_back('\0');
                }
                if (_onmessage)
                {
                    _onmessage->call(std::make_unique<WebSocketEvent>(_buffer, binary));
                }
            }
            break;
        }

        default:
            break;
        }
        return 0;
    }

    void onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback)
    {
        _onopen = std::move(callback);
    }

    void onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback)
    {
        _onmessage = std::move(callback);
    }

    void send(const uint8_t *buffer, size_t length)
    {
        auto temp = new uint8_t[LWS_PRE + length];
        memcpy(temp + LWS_PRE, buffer, length);
        lws_write(_connection, temp + LWS_PRE, length, LWS_WRITE_TEXT);
        delete[] temp;
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

WebSocket::WebSocket(const std::string &url)
{
    _impl = std::make_unique<WebSocketImpl>(url);
}

void WebSocket::onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback)
{
    _impl->onopen(std::forward<std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>>>(callback));
}

void WebSocket::onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback)
{
    _impl->onmessage(std::forward<std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>>>(callback));
}

void WebSocket::send(const void *buffer, size_t length)
{
    _impl->send(static_cast<const uint8_t *>(buffer), length);
}

void WebSocket::service(int timeout_ms)
{
    _impl->service(timeout_ms);
}

WebSocket::~WebSocket() {}