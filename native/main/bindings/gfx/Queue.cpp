#include "Queue.hpp"
#include "DeviceThread.hpp"
#include "base/threading/Semaphore.hpp"

namespace binding::gfx
{
    v8::Local<v8::FunctionTemplate> Queue::createTemplate()
    {
        v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

        auto ctor = Binding::createTemplate();

        sugar::v8::ctor_name(ctor, "Queue");

        sugar::v8::ctor_function(
            ctor,
            "submit",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Queue>(info.This());

                auto js_submitInfo = info[0].As<v8::Object>();
                SubmitInfo c_submitInfo{};

                auto js_waitSemaphore = sugar::v8::object_get(js_submitInfo, "waitSemaphore").As<v8::Object>();
                if (!js_waitSemaphore->IsUndefined())
                {
                    c_submitInfo.waitSemaphore = Binding::c_obj<Semaphore>(js_waitSemaphore);
                }

                auto js_waitDstStageMask = sugar::v8::object_get(js_submitInfo, "waitDstStageMask").As<v8::Number>();
                if (!js_waitDstStageMask->IsUndefined())
                {
                    c_submitInfo.waitDstStageMask = js_waitDstStageMask->Value();
                }

                auto js_signalSemaphore = sugar::v8::object_get(js_submitInfo, "signalSemaphore").As<v8::Object>();
                if (!js_signalSemaphore->IsUndefined())
                {
                    c_submitInfo.signalSemaphore = Binding::c_obj<Semaphore>(js_signalSemaphore);
                }

                auto js_commandBuffer = sugar::v8::object_get(js_submitInfo, "commandBuffer").As<v8::Object>();
                c_submitInfo.commandBuffer = Binding::c_obj<CommandBuffer>(js_commandBuffer);

                auto c_fence = c_obj->retain<Fence>(info[1]);
                c_fence->retain(js_submitInfo, c_fence->submitInfo);

                auto f = new auto(
                    [=]()
                    {
                        c_obj->submit(c_submitInfo, c_fence);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        sugar::v8::ctor_function(
            ctor,
            "present",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Queue>(info.This());
                auto c_waitSemaphore = c_obj->retain<Semaphore>(info[0], c_obj->_present_semaphore);

                auto f = new auto(
                    [=]()
                    {
                        c_obj->present(c_waitSemaphore);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        sugar::v8::ctor_function(
            ctor,
            "waitFence",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Queue>(info.This());
                auto c_fence = Binding::c_obj<Fence>(info[0].As<v8::Object>());
                logan::Semaphore semaphore;
                auto f = new auto(
                    [=, &semaphore]()
                    {
                        c_obj->waitFence(c_fence);
                        semaphore.signal();
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
                semaphore.wait();
                c_obj->release(c_fence->js_obj());
            });

        return scope.Escape(ctor);
    }
}
