#pragma once

#include "v8/libplatform/libplatform.h"
#include "v8/v8-isolate.h"
#include "InspectorClient.hpp"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "SDL_events.h"
#include "events.hpp"

namespace zero
{
    class Loop : public TaskRunner
    {
    private:
        std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchStartCb;
        std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchMoveCb;
        std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchEndCb;
        std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> _wheelCb;
        std::unique_ptr<bastard::Lambda<void>> _frameCb;

        int _running = 1;

        ThreadSafeQueue<std::unique_ptr<bastard::Lambda<void>>> _taskQueue;

        Loop() {};

    protected:
        void post(std::unique_ptr<bastard::Lambda<void>> &&lambda) override
        {
            _taskQueue.push(std::move(lambda));
        }

    public:
        static Loop &instance()
        {
            static Loop instance;
            return instance;
        }

        // refer to wx api
        void onTouchStart(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchStartCb = std::move(cb); }
        void onTouchMove(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchMoveCb = std::move(cb); }
        void onTouchEnd(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchEndCb = std::move(cb); }
        void onWheel(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> &&cb) { _wheelCb = std::move(cb); }
        void onFrame(std::unique_ptr<bastard::Lambda<void>> &&cb) { _frameCb = std::move(cb); }

        using TaskRunner::post;

        int service(SDL_Window *window, v8::Platform *platform, v8::Isolate *isolate, v8::Local<v8::Promise> promise, InspectorClient *inspectorClient);

        void terminate()
        {
            post([this]
                 { _running = -1; });
        }

        ~Loop() {};
    };
}