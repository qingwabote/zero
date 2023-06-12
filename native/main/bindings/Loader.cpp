#include "log.h"
#include "Loader.hpp"
#include "sugars/v8sugar.hpp"
#include <fstream>

#define STB_IMAGE_IMPLEMENTATION
#include "internal/stb_image.h"
#include "ImageBitmap.hpp"

namespace binding
{
    v8::Local<v8::Promise>
    Loader::load(std::filesystem::path path, const std::string type)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> l_resolver = v8::Promise::Resolver::New(context).ToLocalChecked();

        std::filesystem::current_path(_currentPath);
        std::error_code ec;
        std::filesystem::path abs_path = std::filesystem::canonical(path, ec);
        if (ec)
        {
            std::string msg{ec.message() + ": " + path.string()};
            l_resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked())).ToChecked();
            return scrop.Escape(l_resolver->GetPromise());
        }
        std::uintmax_t size = std::filesystem::file_size(abs_path, ec);
        if (ec)
        {
            std::string msg{ec.message() + ": " + abs_path.string()};
            l_resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked())).ToChecked();
            return scrop.Escape(l_resolver->GetPromise());
        }

        v8::Global<v8::Promise::Resolver> g_resolver(isolate, l_resolver);

        auto foreground = _foreground;
        auto f = new auto(
            [foreground, abs_path, size, type, g_resolver = std::move(g_resolver)]() mutable
            {
                auto res = std::unique_ptr<char, decltype(free) *>{(char *)malloc(size), free};
                std::ifstream stream{abs_path.string(), std::ios::binary};
                stream.read(res.get(), size);

                if (type == "text")
                {
                    foreground->post(new auto(
                        [res = std::move(res), size, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            v8::Local<v8::String> str = v8::String::NewFromUtf8(isolate, res.get(), v8::NewStringType::kNormal, size).ToLocalChecked();
                            g_resolver.Get(isolate)->Resolve(context, str).ToChecked();
                        }));
                }
                else if (type == "arraybuffer")
                {
                    foreground->post(new auto(
                        [res = std::move(res), size, g_resolver = std::move(g_resolver)]() mutable
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            std::shared_ptr<v8::BackingStore> backingStore = v8::ArrayBuffer::NewBackingStore(
                                res.release(), size,
                                [](void *data, size_t length, void *deleter_data)
                                {
                                    free(data);
                                },
                                nullptr);
                            auto arraybuffer = v8::ArrayBuffer::New(isolate, backingStore);

                            g_resolver.Get(isolate)->Resolve(context, arraybuffer).ToChecked();
                        }));
                }
                else if (type == "bitmap")
                {
                    int x{0}, y{0}, channels{0};
                    std::unique_ptr<void, void (*)(void *)> pixels(
                        stbi_load_from_memory(reinterpret_cast<stbi_uc *>(res.get()), size, &x, &y, &channels, STBI_rgb_alpha),
                        stbi_image_free);

                    foreground->post(new auto(
                        [pixels = std::move(pixels), x, y, g_resolver = std::move(g_resolver)]() mutable
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            g_resolver.Get(isolate)->Resolve(context, (new ImageBitmap(pixels, x, y))->js_obj()).ToChecked();
                        }));
                }
            });
        _background->post(f);

        return scrop.Escape(l_resolver->GetPromise());
    }

    v8::Local<v8::FunctionTemplate> Loader::createTemplate()
    {
        auto ctor = Binding::createTemplate();

        sugar::v8::ctor_name(ctor, "Loader");
        sugar::v8::ctor_function(
            ctor,
            "load",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto isolate = info.GetIsolate();

                auto c_obj = Binding::c_obj<Loader>(info.This());
                auto url = info[0].As<v8::String>();
                auto type = info[1].As<v8::String>();
                auto promise = c_obj->load(*v8::String::Utf8Value(isolate, url), *v8::String::Utf8Value(isolate, type));
                info.GetReturnValue().Set(promise);
            });
        return ctor;
    }
}