#pragma once

#include "WebSocket.hpp"
#include "v8/v8-inspector.h"
#include "InspectorChannel.hpp"

class InspectorClient : public v8_inspector::V8InspectorClient
{
private:
    zero::WebSocket _socket{"ws://:6086"};
    std::unique_ptr<v8_inspector::V8Inspector> _inspector;
    std::unique_ptr<v8_inspector::V8InspectorSession> _session;
    std::unique_ptr<InspectorChannel> _channel;

    bool _blocked{false};

public:
    InspectorClient(v8::Local<v8::Context> context);

    void runMessageLoopOnPause(int contextGroupId) override;
    void quitMessageLoopOnPause() override;

    void tick();

    ~InspectorClient();
};
