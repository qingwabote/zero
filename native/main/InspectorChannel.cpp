#include "InspectorChannel.hpp"
#include <codecvt>
#include <locale>
#include "log.h"

void InspectorChannel::sendResponse(int callId, std::unique_ptr<v8_inspector::StringBuffer> message)
{
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> Conv;
    auto characters16 = reinterpret_cast<const char16_t *>(message->string().characters16());
    auto utf8 = Conv.to_bytes(characters16, characters16 + message->string().length());

    // ZERO_LOG_INFO("sendResponse %s", utf8.c_str());

    _socket->send(std::move(utf8));
}

void InspectorChannel::sendNotification(std::unique_ptr<v8_inspector::StringBuffer> message)
{
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> Conv;
    auto characters16 = reinterpret_cast<const char16_t *>(message->string().characters16());
    auto utf8 = Conv.to_bytes(characters16, characters16 + message->string().length());

    // ZERO_LOG_INFO("sendNotification %s", utf8.c_str());

    _socket->send(std::move(utf8));
}

void InspectorChannel::flushProtocolNotifications()
{
    // https://github.com/Tencent/puerts/blob/006e6c63479a9ffb4050d071201f7f9faf1fdb66/unreal/Puerts/Source/JsEnv/Private/V8InspectorImpl.cpp
    // do noting
}
