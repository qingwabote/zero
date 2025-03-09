#pragma once

#include <string>
#include <vector>
#include <memory>
#include <bastard/lambda.hpp>

namespace zero
{
    class WebSocketEvent
    {
    public:
        const bool isBinary = false;
        std::string data;

        WebSocketEvent() {}

        WebSocketEvent(std::string &&data, bool isBinary) : data(std::move(data)), isBinary(isBinary) {}
    };

    using WebSocketCallback = std::unique_ptr<bastard::Lambda<void, std::unique_ptr<WebSocketEvent>>>;
    class WebSocketImpl;
    class WebSocket
    {
    private:
        std::unique_ptr<WebSocketImpl> _impl;

    public:
        int readyState();

        WebSocket(const std::string &url);

        virtual void onopen(WebSocketCallback &&callback);
        virtual void onmessage(WebSocketCallback &&callback);

        virtual void send(std::string &&message);

        void service(int timeout_ms);

        void cancel();

        virtual ~WebSocket();
    };
}
