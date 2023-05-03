#include "Platform.hpp"
#include "bindings/ImageBitmap.hpp"
#include "base/threading/ThreadPool.hpp"
#include "Window.hpp"

#define STB_IMAGE_IMPLEMENTATION
#include "internal/stb_image.h"

namespace binding
{
    v8::Local<v8::Promise> Platform::decodeImage(v8::Local<v8::ArrayBuffer> buffer)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> l_resolver = v8::Promise::Resolver::New(context).ToLocalChecked();
        v8::Global<v8::Promise::Resolver> g_resolver(isolate, l_resolver);

        std::shared_ptr<v8::BackingStore> store = buffer->GetBackingStore();

        auto f = new auto(
            [store, g_resolver = std::move(g_resolver)]() mutable
            {
                int x{0}, y{0}, channels{0};
                std::unique_ptr<void, void (*)(void *)> pixels(
                    stbi_load_from_memory(static_cast<stbi_uc *>(store->Data()), store->ByteLength(), &x, &y, &channels, STBI_rgb_alpha),
                    stbi_image_free);
                auto f = new auto(
                    [pixels = std::move(pixels), x, y, g_resolver = std::move(g_resolver)]() mutable
                    {
                        v8::Isolate *isolate = v8::Isolate::GetCurrent();
                        v8::EscapableHandleScope scrop(isolate);
                        v8::Local<v8::Context> context = isolate->GetCurrentContext();

                        g_resolver.Get(isolate)->Resolve(context, (new ImageBitmap(pixels, x, y))->js_obj());
                    });
                Window::instance().run(UniqueFunction::create<decltype(f)>(f));
            });
        ThreadPool::shared().run(UniqueFunction::create<decltype(f)>(f));

        return scrop.Escape(l_resolver->GetPromise());
    }

    v8::Local<v8::FunctionTemplate> Platform::createTemplate()
    {
        sugar::v8::Class cls{"Platform"};
        cls.defineFunction(
            "decodeImage",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Platform>(info.This());
                info.GetReturnValue().Set(c_obj->decodeImage(info[0].As<v8::ArrayBuffer>()));
            });
        return cls.flush();
    }
}