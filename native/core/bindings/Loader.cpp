#include "Loader.hpp"
#include "sugars/v8sugar.hpp"
#include "sugars/sdlsugar.hpp"
#include "Window.hpp"
#include "ThreadPool.hpp"

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
        std::string file = std::filesystem::absolute(path).string();

        auto f = new auto(
            [file, type, g_resolver = std::move(g_resolver)]() mutable
            {
                SDL_RWops *rw = SDL_RWFromFile(file.c_str(), "r");
                if (!rw)
                {
                    auto f = new auto(
                        [file, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::EscapableHandleScope scrop(isolate);
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            std::string msg("open file failed: ");
                            msg += file;
                            g_resolver.Get(isolate)->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                        });
                    Window::instance()->beforeTick(UniqueFunction::create<decltype(f)>(f));
                    return;
                }
                auto size = SDL_RWsize(rw);
                // if (size == 0)
                // {
                //     std::string msg("file size is zero: ");
                //     msg += s_path;
                //     resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                //     return scrop.Escape(resolver->GetPromise());
                // }

                char *res = (char *)malloc(size);
                if (size && SDL_RWread(rw, res, size, 1) != 1)
                {
                    // https://gitlab.com/wikibooks-opengl/modern-tutorials/blob/master/common-sdl2/shader_utils.cpp
                    throw "not implemented yet";
                }

                if (type == "text")
                {
                    auto f = new auto(
                        [res, size, g_resolver = std::move(g_resolver)]()
                        {
                            v8::Isolate *isolate = v8::Isolate::GetCurrent();
                            v8::EscapableHandleScope scrop(isolate);
                            v8::Local<v8::Context> context = isolate->GetCurrentContext();

                            v8::Local<v8::String> str = v8::String::NewFromUtf8(isolate, res, v8::NewStringType::kNormal, size).ToLocalChecked();
                            free(res);
                            g_resolver.Get(isolate)->Resolve(context, str);
                        });
                    Window::instance()->beforeTick(UniqueFunction::create<decltype(f)>(f));
                }
                else if (type == "arraybuffer")
                {
                    auto f = new auto(
                        [res, size, g_resolver = std::move(g_resolver)]()
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
                            memcpy(arraybuffer->GetBackingStore()->Data(), res, size);
                            free(res);

                            g_resolver.Get(isolate)->Resolve(context, arraybuffer);
                        });
                    Window::instance()->beforeTick(UniqueFunction::create<decltype(f)>(f));
                }
            });
        ThreadPool::instance().run(UniqueFunction::create<decltype(f)>(f));

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