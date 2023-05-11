#include "Loader.hpp"
#include "sugars/v8sugar.hpp"
#include "Window.hpp"
#include "base/threading/ThreadPool.hpp"
#include <fstream>

namespace binding
{
    v8::Local<v8::Promise>
    Loader::load(std::filesystem::path path, const std::string type)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> l_resolver = v8::Promise::Resolver::New(context).ToLocalChecked();
        v8::Global<v8::Promise::Resolver> g_resolver(isolate, l_resolver);

        std::filesystem::current_path(_currentPath);
        std::filesystem::path abs_path = std::filesystem::canonical(path);

        auto f = new auto(
            [abs_path, type, g_resolver = std::move(g_resolver)]() mutable
            {
                std::error_code ec;
                std::uintmax_t size = std::filesystem::file_size(abs_path, ec);
                if (ec)
                {
                    auto f = new auto(
                        [abs_path, ec, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::EscapableHandleScope scrop(isolate);
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            std::string msg = ec.message() + ": " + abs_path.string();
                            g_resolver.Get(isolate)->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked())).ToChecked();
                        });
                    Window::instance().run(UniqueFunction::create<decltype(f)>(f));
                    return;
                }

                auto res = std::unique_ptr<char, decltype(free) *>{(char *)malloc(size), free};
                std::ifstream is;
                is.open(abs_path.string(), std::ios::binary);
                is.read(res.get(), size);

                if (type == "text")
                {
                    auto f = new auto(
                        [res = std::move(res), size, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::EscapableHandleScope scrop(isolate);
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            v8::Local<v8::String> str = v8::String::NewFromUtf8(isolate, res.get(), v8::NewStringType::kNormal, size).ToLocalChecked();
                            g_resolver.Get(isolate)->Resolve(context, str).ToChecked();
                        });
                    Window::instance().run(UniqueFunction::create<decltype(f)>(f));
                }
                else if (type == "arraybuffer")
                {
                    auto f = new auto(
                        [res = std::move(res), size, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::EscapableHandleScope scrop(isolate);
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            // auto backingStore = v8::ArrayBuffer::NewBackingStore(
                            //     res, size,
                            //     [](void *data, size_t length, void *deleter_data)
                            //     {
                            //         // free(data);
                            //     },
                            //     nullptr);
                            // auto arraybuffer = v8::ArrayBuffer::New(isolate, std::move(backingStore));

                            auto arraybuffer = v8::ArrayBuffer::New(isolate, size);
                            memcpy(arraybuffer->GetBackingStore()->Data(), res.get(), size);

                            g_resolver.Get(isolate)->Resolve(context, arraybuffer).ToChecked();
                        });
                    Window::instance().run(UniqueFunction::create<decltype(f)>(f));
                }
            });
        ThreadPool::shared().run(UniqueFunction::create<decltype(f)>(f));

        return scrop.Escape(l_resolver->GetPromise());
    }

    v8::Local<v8::FunctionTemplate> Loader::createTemplate()
    {
        sugar::v8::Class cls{"Loader"};
        cls.defineFunction(
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
        return cls.flush();
    }
}