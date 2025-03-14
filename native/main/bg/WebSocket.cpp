#include "./WebSocket.hpp"
#include "../Loop.hpp"
#include "log.h"

namespace bg
{
    WebSocket::WebSocket(const std::string &url) : zero::WebSocket(url)
    {
        if (readyState() < 0)
        {
            return;
        }

        ZERO_LOG_INFO("WebSocket create thread");
        _thread = std::make_unique<std::thread>(
            [this]()
            {
                while (_running)
                {
                    std::unique_ptr<bastard::Lambda<void>> task;
                    while (_tasks.pop(task))
                    {
                        task->call();
                    }

                    service(0);
                }
            });
    }

    void WebSocket::onopen(zero::WebSocketCallback &&callback)
    {
        zero::WebSocketCallback cb(bastard::take_lambda(
            [this, callback = std::move(callback)](std::unique_ptr<zero::WebSocketEvent> event) mutable
            {
                zero::Loop::instance().post(
                    [&callback, event = std::move(event)]() mutable
                    {
                        callback->call(std::move(event));
                    });
            }));
        _tasks.push(bastard::take_lambda(
            [this, cb = std::move(cb)]() mutable
            {
                zero::WebSocket::onopen(std::move(cb));
            }));
    }

    void WebSocket::onclose(zero::WebSocketCallback &&callback)
    {
        zero::WebSocketCallback cb(bastard::take_lambda(
            [this, callback = std::move(callback)](std::unique_ptr<zero::WebSocketEvent> event) mutable
            {
                zero::Loop::instance().post(
                    [&callback, event = std::move(event)]() mutable
                    {
                        callback->call(std::move(event));
                    });
            }));
        _tasks.push(bastard::take_lambda(
            [this, cb = std::move(cb)]() mutable
            {
                zero::WebSocket::onclose(std::move(cb));
            }));
    }

    void WebSocket::onmessage(zero::WebSocketCallback &&callback)
    {
        zero::WebSocketCallback cb(bastard::take_lambda(
            [this, callback = std::move(callback)](std::unique_ptr<zero::WebSocketEvent> event) mutable
            {
                zero::Loop::instance().post(
                    [&callback, event = std::move(event)]() mutable
                    {
                        callback->call(std::move(event));
                    });
            }));
        _tasks.push(bastard::take_lambda(
            [this, cb = std::move(cb)]() mutable
            {
                zero::WebSocket::onmessage(std::move(cb));
            }));
    }

    void WebSocket::send(std::string &&message)
    {
        _tasks.push(bastard::take_lambda(
            [this, message = std::move(message)]() mutable
            {
                zero::WebSocket::send(std::move(message));
            }));
        wake();
    }

    WebSocket::~WebSocket()
    {
        if (_thread)
        {
            wake();
            _running = false;
            _thread->join();
        }
    }
}
