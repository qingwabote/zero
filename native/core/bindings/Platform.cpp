#include "Platform.hpp"
#include "bindings/ImageBitmap.hpp"

#define STB_IMAGE_IMPLEMENTATION
#include "thirdparty/stb_image.h"

namespace binding
{
    v8::Local<v8::Promise> Platform::decodeImage(v8::Local<v8::ArrayBuffer> buffer)
    {
        std::shared_ptr<v8::BackingStore> store = buffer->GetBackingStore();
        int x, y, channels;
        stbi_uc *pixels = stbi_load_from_memory(static_cast<stbi_uc *>(store->Data()), store->ByteLength(), &x, &y, &channels, STBI_rgb_alpha);

        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> resolver = v8::Promise::Resolver::New(context).ToLocalChecked();
        resolver->Resolve(context, (new ImageBitmap(pixels, x, y))->js_obj());

        return scrop.Escape(resolver->GetPromise());
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