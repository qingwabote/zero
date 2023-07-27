#include "InspectorChannel.hpp"
#include <codecvt>
#include <locale>
#include "log.h"

InspectorChannel::InspectorChannel(WebSocket *socket) : _socket(socket) {}

void InspectorChannel::sendResponse(int callId, std::unique_ptr<v8_inspector::StringBuffer> message)
{
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> Conv;
    auto characters16 = reinterpret_cast<const char16_t *>(message->string().characters16());
    auto utf8 = Conv.to_bytes(characters16, characters16 + message->string().length());

    // ZERO_LOG("sendResponse %s", utf8.c_str());

    _socket->send(utf8.c_str(), utf8.size());
}

void InspectorChannel::sendNotification(std::unique_ptr<v8_inspector::StringBuffer> message)
{
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> Conv;
    auto characters16 = reinterpret_cast<const char16_t *>(message->string().characters16());
    auto utf8 = Conv.to_bytes(characters16, characters16 + message->string().length());

    // ZERO_LOG("sendNotification %s", utf8.c_str());

    _socket->send(utf8.c_str(), utf8.size());
}

void InspectorChannel::flushProtocolNotifications()
{
}
