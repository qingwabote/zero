#include "InspectorClient.hpp"
#include "log.h"

InspectorClient::InspectorClient()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    _inspector = v8_inspector::V8Inspector::create(isolate, this);

    const uint8_t name[] = "V8InspectorContext";
    _inspector->contextCreated(v8_inspector::V8ContextInfo(isolate->GetCurrentContext(), 1, v8_inspector::StringView(name, sizeof(name) - 1)));

    _socket = std::make_unique<WebSocket>("xxx:6086");

    _channel = std::make_unique<InspectorChannel>(_socket.get());

    _socket->onopen(UniqueFunction<void, std::unique_ptr<WebSocketEvent>>::create(new auto(
        [this](std::unique_ptr<WebSocketEvent> event)
        {
            v8_inspector::StringView DummyState;
            _session = _inspector->connect(1, _channel.get(), DummyState);
        })));

    _socket->onmessage(UniqueFunction<void, std::unique_ptr<WebSocketEvent>>::create(new auto(
        [this](std::unique_ptr<WebSocketEvent> event)
        {
            // ZERO_LOG("onmessage %s", event->buffer()->data());
            v8_inspector::StringView stringView(reinterpret_cast<uint8_t *>(event->buffer()->data()), event->buffer()->size() - 1);
            _session->dispatchProtocolMessage(stringView);
        })));
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
    _socket->service(-1);
}

InspectorClient::~InspectorClient()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    _inspector->contextDestroyed(isolate->GetCurrentContext());
}
