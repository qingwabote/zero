#include "Loader.hpp"
#include "sugars/v8sugar.hpp"
#include "sugars/sdlsugar.hpp"
#include "Window.hpp"

namespace binding
{
    ThreadSafeQueue<LoaderItem> Loader::_loaderItemQueue;

    v8::Local<v8::Promise>
    Loader::load(std::filesystem::path path, const char *type)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> resolver = v8::Promise::Resolver::New(context).ToLocalChecked();

        std::filesystem::current_path(_currentPath);

        _loaderItemQueue.push({std::filesystem::absolute(path).string(), type, resolver});

        if (!_loaderThreadCreated)
        {
            auto t = std::thread(
                []()
                {
                    while (true)
                    {
                        auto items = _loaderItemQueue.flush(true);
                        for (auto &item : items)
                        {
                            SDL_RWops *rw = SDL_RWFromFile(item.file.c_str(), "r");
                            if (!rw)
                            {
                                Window::instance()->beforeTick(
                                    [item = std::move(item)]()
                                    {
                                        v8::Isolate *isolate = v8::Isolate::GetCurrent();
                                        v8::EscapableHandleScope scrop(isolate);
                                        v8::Local<v8::Context> context = isolate->GetCurrentContext();

                                        std::string msg("open file failed: ");
                                        msg += item.file;
                                        item.resolver.Get(isolate)->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                                    });
                                continue;
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

                            if (item.type == "text")
                            {
                                Window::instance()->beforeTick(
                                    [res, size, item = std::move(item)]()
                                    {
                                        v8::Isolate *isolate = v8::Isolate::GetCurrent();
                                        v8::EscapableHandleScope scrop(isolate);
                                        v8::Local<v8::Context> context = isolate->GetCurrentContext();

                                        v8::Local<v8::String> str = v8::String::NewFromUtf8(isolate, res, v8::NewStringType::kNormal, size).ToLocalChecked();
                                        free(res);
                                        item.resolver.Get(isolate)->Resolve(context, str);
                                    });
                            }
                            else if (item.type == "arraybuffer")
                            {
                                Window::instance()->beforeTick(
                                    [res, size, item = std::move(item)]() mutable
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

                                        item.resolver.Get(isolate)->Resolve(context, arraybuffer);
                                    });
                            }
                        }
                    }
                });
            t.detach();
            _loaderThreadCreated = true;
        }

        return scrop.Escape(resolver->GetPromise());
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