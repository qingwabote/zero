#pragma once

#include <unordered_map>
#include <memory>
#include <bastard/lambda.hpp>

namespace bastard
{
    using EventListener = void *;

    template <typename EventType>
    class EventEmitter
    {
    private:
        std::unordered_multimap<EventType, std::unique_ptr<bastard::LambdaBase>> _listeners;

    public:
        template <typename Lambda>
        EventListener on(EventType type, Lambda &&callback)
        {
            auto listener = bastard::take_lambda(std::move(callback));
            EventListener handle = listener.get();
            _listeners.emplace(type, std::move(listener));
            return handle;
        }

        void off(EventType type, EventListener handle)
        {
            auto range = _listeners.equal_range(type);
            for (auto it = range.first; it != range.second; ++it)
            {
                if (handle == it->second.get())
                {
                    _listeners.erase(it);
                    break;
                }
            }
        }

        template <typename... Args>
        void emit(EventType type, Args &&...args)
        {
            auto range = _listeners.equal_range(type);
            for (auto it = range.first; it != range.second; ++it)
            {
                auto listener = static_cast<bastard::Lambda<void, Args...> *>(it->second.get());
                listener->call(std::forward<Args>(args)...);
            }
        }
    };
}