#pragma once

#include <string>
#include <vector>
#include <memory>
#include "base/callable.hpp"

class WebSocketEvent
{
private:
    bool _isBinary{true};
    std::shared_ptr<std::vector<char>> _buffer{nullptr};

public:
    bool isBinary() { return _isBinary; }
    std::shared_ptr<std::vector<char>> buffer() { return _buffer; }

    WebSocketEvent() {}

    WebSocketEvent(const std::shared_ptr<std::vector<char>> &buffer, bool isBinary) : _buffer(buffer), _isBinary(isBinary) {}
};

class WebSocketImpl;

class WebSocket
{
private:
    std::unique_ptr<WebSocketImpl> _impl;

public:
    WebSocket(const std::string &url);

    void onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback);
    void onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<WebSocketEvent>>> &&callback);

    void send(const void *buffer, size_t length);

    void service(int timeout_ms);

    ~WebSocket();
};
