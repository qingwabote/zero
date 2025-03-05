#pragma once

#include "../WebSocket.hpp"
#include "../base/TaskRunner.hpp"
#include "../base/threading/SCSP.hpp"
#include "../base/callable.hpp"
#include <atomic>
#include <thread>

namespace bg
{
    class WebSocket : public zero::WebSocket
    {
    private:
        TaskRunner *_foreground = nullptr;

        std::atomic<bool> _running = true;
        std::unique_ptr<std::thread> _thread;

        SCSP<std::unique_ptr<callable::Callable<void>>> _tasks{8};

    public:
        WebSocket(TaskRunner *foreground, const std::string &url);

        virtual void onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<zero::WebSocketEvent>>> &&callback) override;
        virtual void onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<zero::WebSocketEvent>>> &&callback) override;

        virtual void WebSocket::send(std::string &&message) override;

        ~WebSocket();
    };
}