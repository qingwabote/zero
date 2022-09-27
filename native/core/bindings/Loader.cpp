#include "Loader.hpp"
#include "sugars/v8sugar.hpp"
#include "sugars/sdlsugar.hpp"

namespace binding
{
    v8::Local<v8::Promise> Loader::load(std::filesystem::path path, const char *type)
    {
        std::filesystem::current_path(_currentPath);
        auto s_path = std::filesystem::absolute(path).string();

        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::EscapableHandleScope scrop(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Promise::Resolver> resolver = v8::Promise::Resolver::New(context).ToLocalChecked();

        SDL_RWops *rw = SDL_RWFromFile(s_path.c_str(), "r");
        if (!rw)
        {
            std::string msg("open file failed: ");
            msg += s_path;
            resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
            return scrop.Escape(resolver->GetPromise());
        }
        auto size = SDL_RWsize(rw);
        // if (size == 0)
        // {
        //     std::string msg("file size is zero: ");
        //     msg += s_path;
        //     resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
        //     return scrop.Escape(resolver->GetPromise());
        // }

        if (strcmp(type, "text") == 0)
        {
            std::vector<char> vector(size);
            if (size && SDL_RWread(rw, vector.data(), size, 1) != 1)
            {
                // https://gitlab.com/wikibooks-opengl/modern-tutorials/blob/master/common-sdl2/shader_utils.cpp
                throw "not implemented yet";
            }
            v8::Local<v8::String> str = v8::String::NewFromUtf8(isolate, vector.data(), v8::NewStringType::kNormal, size).ToLocalChecked();
            resolver->Resolve(context, str);
        }
        else if (strcmp(type, "arraybuffer") == 0)
        {
            v8::Local<v8::ArrayBuffer> arraybuffer = v8::ArrayBuffer::New(isolate, size);
            if (size && SDL_RWread(rw, arraybuffer->GetBackingStore()->Data(), size, 1) != 1)
            {
                // https://gitlab.com/wikibooks-opengl/modern-tutorials/blob/master/common-sdl2/shader_utils.cpp
                throw "not implemented yet";
            }
            resolver->Resolve(context, arraybuffer);
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