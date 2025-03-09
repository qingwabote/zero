#pragma once

#include "v8/v8-inspector.h"
#include "WebSocket.hpp"

class InspectorChannel : public v8_inspector::V8Inspector::Channel
{
private:
    zero::WebSocket &_socket;

public:
    InspectorChannel(zero::WebSocket &socket) : _socket(socket) {}

    void sendResponse(int callId, std::unique_ptr<v8_inspector::StringBuffer> message) override;
    void sendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) override;
    void flushProtocolNotifications() override;
};
