#pragma once

#include <string>
#include <vector>
#include <memory>
#include "base/callable.hpp"
#include "base/TaskRunner.hpp"

namespace zero
{
    class WebSocketEvent
    {
    private:
        bool _isBinary{true};
        std::string _data;

    public:
        bool isBinary() { return _isBinary; }
        std::string &data() { return _data; }

        WebSocketEvent() {}

        WebSocketEvent(std::string &&data, bool isBinary) : _data(std::move(data)), _isBinary(isBinary) {}
    };

    class WebSocketImpl;

    class WebSocket
    {
    private:
        std::unique_ptr<WebSocketImpl> _impl;

    public:
        WebSocket(const std::string &url);

        virtual void onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback);
        virtual void onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback);

        virtual void WebSocket::send(std::string &&message);

        void service(int timeout_ms);

        virtual ~WebSocket();
    };
}
