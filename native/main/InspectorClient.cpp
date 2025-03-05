#include "InspectorClient.hpp"
#include "log.h"

InspectorClient::InspectorClient(const std::shared_ptr<zero::WebSocket> &socket)
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    _inspector = v8_inspector::V8Inspector::create(isolate, this);

    const uint8_t name[] = "V8InspectorContext";
    _inspector->contextCreated(v8_inspector::V8ContextInfo(isolate->GetCurrentContext(), 1, v8_inspector::StringView(name, sizeof(name) - 1)));

    _channel = std::make_unique<InspectorChannel>(socket);

    socket->onopen(std::unique_ptr<callable::Callable<void, std::unique_ptr<zero::WebSocketEvent>>>(new callable::CallableLambda(new auto(
        [this](std::unique_ptr<zero::WebSocketEvent> event)
        {
            v8_inspector::StringView DummyState;
            _session = _inspector->connect(1, _channel.get(), DummyState, v8_inspector::V8Inspector::kFullyTrusted);
        }))));

    socket->onmessage(std::unique_ptr<callable::Callable<void, std::unique_ptr<zero::WebSocketEvent>>>(new callable::CallableLambda(new auto(
        [this](std::unique_ptr<zero::WebSocketEvent> event)
        {
            v8_inspector::StringView stringView(reinterpret_cast<uint8_t *>(event->data.data()), event->data.size());
            _session->dispatchProtocolMessage(stringView);
        }))));
    _socket = socket;
}

void InspectorClient::runMessageLoopOnPause(int contextGroupId)
{
    _blocked = true;
    while (_blocked)
    {
        _socket->service(0);
    }
}

void InspectorClient::quitMessageLoopOnPause()
{
    _blocked = false;
}

void InspectorClient::tick()
{
    // https://github.com/warmcat/libwebsockets/issues/1735
    _socket->service(-1);
}

InspectorClient::~InspectorClient()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    _inspector->contextDestroyed(isolate->GetCurrentContext());
}
