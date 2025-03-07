#include "./WebSocket.hpp"

namespace bg
{
    WebSocket::WebSocket(TaskRunner *foreground, const std::string &url) : zero::WebSocket(url), _foreground(foreground)
    {
        _thread = std::make_unique<std::thread>(
            [this]()
            {
                while (_running)
                {
                    std::unique_ptr<callable::Callable<void>> task;
                    while (_tasks.pop(task))
                    {
                        task->call();
                    }

                    service(0);
                }
            });
    }

    void WebSocket::onopen(zero::WebSocketCallback callback)
    {
        zero::WebSocketCallback cb(new callable::CallableLambda(new auto(
            [this, callback = std::move(callback)](std::unique_ptr<zero::WebSocketEvent> event) mutable
            {
                _foreground->post(new auto(
                    [callback = std::move(callback), event = std::move(event)]() mutable
                    {
                        callback->call(std::move(event));
                    }));
            })));
        _tasks.push(std::unique_ptr<callable::Callable<void>>(new callable::CallableLambda(new auto(
            [this, cb = std::move(cb)]() mutable
            {
                zero::WebSocket::onopen(std::move(cb));
            }))));
    }

    void WebSocket::onmessage(zero::WebSocketCallback callback)
    {
        zero::WebSocketCallback cb(new callable::CallableLambda(new auto(
            [this, callback = std::move(callback)](std::unique_ptr<zero::WebSocketEvent> event) mutable
            {
                _foreground->post(new auto(
                    [callback = std::move(callback), event = std::move(event)]() mutable
                    {
                        callback->call(std::move(event));
                    }));
            })));
        _tasks.push(std::unique_ptr<callable::Callable<void>>(new callable::CallableLambda(new auto(
            [this, cb = std::move(cb)]() mutable
            {
                zero::WebSocket::onmessage(std::move(cb));
            }))));
    }

    void WebSocket::send(std::string &&message)
    {
        auto f = new auto(
            [this, message = std::move(message)]() mutable
            {
                zero::WebSocket::send(std::move(message));
            });
        _tasks.push(std::unique_ptr<callable::Callable<void>>(new callable::CallableLambda(f)));
    }

    WebSocket::~WebSocket()
    {
        _running = false;
        _thread->join();
    }
}
