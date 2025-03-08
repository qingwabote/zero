#pragma once

#include "../WebSocket.hpp"
#include "../base/threading/SCSP.hpp"
#include <bastard/lambda.hpp>
#include <atomic>
#include <thread>

namespace bg
{
    class WebSocket : public zero::WebSocket
    {
    private:
        std::atomic<bool> _running = true;
        std::unique_ptr<std::thread> _thread;

        SCSP<std::unique_ptr<bastard::Lambda<void>>> _tasks{8};

    public:
        WebSocket(const std::string &url);

        zero::WebSocketCallback onopen() { throw "not implemented yet"; }
        void onopen(zero::WebSocketCallback &callback) { onopen(std::move(callback)); }
        virtual void onopen(zero::WebSocketCallback &&callback) override;

        zero::WebSocketCallback onmessage() { throw "not implemented yet"; }
        void onmessage(zero::WebSocketCallback &callback) { onmessage(std::move(callback)); }
        virtual void onmessage(zero::WebSocketCallback &&callback) override;

        virtual void send(std::string &&message) override;

        ~WebSocket();
    };
}