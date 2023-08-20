#pragma once

#include "../callable.hpp"
#include <unordered_map>
#include <memory>

namespace event
{
    using Handle = void *;

    class Emitter
    {
    private:
        std::unordered_multimap<uint32_t, std::unique_ptr<callable::CallableBase>> _listeners;

    public:
        template <typename Lambda>
        Handle on(uint32_t type, Lambda *callback)
        {
            auto listener = new callable::CallableLambda(callback);
            _listeners.emplace(type, std::unique_ptr<callable::CallableBase>(listener));
            return listener;
        }

        void off(uint32_t type, Handle handle)
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
        void emit(uint32_t type, Args &&...args)
        {
            auto range = _listeners.equal_range(type);
            for (auto it = range.first; it != range.second; ++it)
            {
                auto listener = static_cast<callable::Callable<void, Args...> *>(it->second.get());
                listener->call(std::forward<Args>(args)...);
            }
        }
    };
}