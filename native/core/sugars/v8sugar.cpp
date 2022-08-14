#include "v8sugar.hpp"
#include "libplatform/libplatform.h"
#include "SDL.h"
#include "sdlsugar.hpp"

namespace sugar
{
    static void isolateDeleter(v8::Isolate *ptr)
    {
        ptr->Dispose();
        v8::V8::Dispose();
        v8::V8::DisposePlatform();
    }
    unique_isolate v8_initWithIsolate()
    {
        v8::V8::InitializePlatform(v8::platform::NewDefaultPlatform().release());
        v8::V8::Initialize();

        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<v8::ArrayBuffer::Allocator>{v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        return unique_isolate{ v8::Isolate::New(create_params), isolateDeleter };
    }

    v8::MaybeLocal<v8::Module> v8_module_load(
        v8::Local<v8::Context> context,
        v8::Local<v8::String> specifier,
        v8::Local<v8::FixedArray> import_assertions,
        v8::Local<v8::Module> referrer)
    {
        v8::Isolate::Scope isolate_scope(context->GetIsolate());
        v8::EscapableHandleScope handle_scope(context->GetIsolate());
        v8::Context::Scope context_scope(context);

        const char *base = SDL_GetBasePath();
        v8::Local<v8::String> full = v8::String::Concat(context->GetIsolate(), v8::String::NewFromUtf8(context->GetIsolate(), base).ToLocalChecked(), specifier);
        v8::String::Utf8Value utf8{context->GetIsolate(), full};

        auto res = sugar::sdl_rw_readUtf8(*utf8);
        if (!res)
        {
            context->GetIsolate()->ThrowException(v8::String::NewFromUtf8Literal(context->GetIsolate(), "module resolution error"));
            return v8::MaybeLocal<v8::Module>();
        }

        auto str = v8::String::NewFromUtf8(context->GetIsolate(), res.get()).ToLocalChecked();

        auto origin = v8::ScriptOrigin(context->GetIsolate(), specifier, 0, 0, false, -1, v8::Local<v8::Value>(), false, false, true);
        v8::ScriptCompiler::Source source(str, origin);
        auto maybeModule = v8::ScriptCompiler::CompileModule(context->GetIsolate(), &source);

        return handle_scope.EscapeMaybe(maybeModule);
    }

    std::string v8_stackTrace_toString(v8::Local<v8::StackTrace> stack)
    {
        std::string stackStr;
        if (stack.IsEmpty())
        {
            return stackStr;
        }

        char tmp[100] = {0};
        for (int i = 0, e = stack->GetFrameCount(); i < e; ++i)
        {
            v8::Local<v8::StackFrame> frame = stack->GetFrame(v8::Isolate::GetCurrent(), i);
            v8::Local<v8::String> script = frame->GetScriptName();
            std::string scriptName;
            if (!script.IsEmpty())
            {
                scriptName = *v8::String::Utf8Value(v8::Isolate::GetCurrent(), script);
            }

            v8::Local<v8::String> func = frame->GetFunctionName();
            std::string funcName;
            if (!func.IsEmpty())
            {
                funcName = *v8::String::Utf8Value(v8::Isolate::GetCurrent(), func);
            }

            stackStr += " - [";
            snprintf(tmp, sizeof(tmp), "%d", i);
            stackStr += tmp;
            stackStr += "]";
            stackStr += (funcName.empty() ? "anonymous" : funcName.c_str());
            stackStr += "@";
            stackStr += (scriptName.empty() ? "(no filename)" : scriptName.c_str());
            stackStr += ":";
            snprintf(tmp, sizeof(tmp), "%d", frame->GetLineNumber());
            stackStr += tmp;

            if (i < (e - 1))
            {
                stackStr += "\n";
            }
        }

        return stackStr;
    }
}