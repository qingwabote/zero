#include "v8sugar.hpp"
#include "libplatform/libplatform.h"
#include "SDL.h"
#include "sdlsugar.hpp"
#include <sstream>
#include <unordered_map>

namespace sugar
{
    static std::unordered_map<std::string, v8::Global<v8::Module>> moduleCache;

    static void isolateDeleter(v8::Isolate *ptr)
    {
        for (auto &it : moduleCache)
        {
            it.second.Reset();
        }
        ptr->Dispose();
        v8::V8::Dispose();
        v8::V8::DisposePlatform();
    }
    unique_isolate v8_initWithIsolate()
    {
        v8::V8::InitializePlatform(v8::platform::NewDefaultPlatform().release());
        v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
        v8::V8::Initialize();

        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<v8::ArrayBuffer::Allocator>{v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        return unique_isolate{v8::Isolate::New(create_params), isolateDeleter};
    }

    std::string v8_stackTrace_toString(v8::Local<v8::StackTrace> stack)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::HandleScope scope(isolate);

        std::string stackStr;
        if (stack.IsEmpty())
        {
            return stackStr;
        }

        char tmp[100] = {0};
        for (int i = 0, e = stack->GetFrameCount(); i < e; ++i)
        {
            v8::Local<v8::StackFrame> frame = stack->GetFrame(isolate, i);
            v8::Local<v8::String> script = frame->GetScriptName();
            std::string scriptName;
            if (!script.IsEmpty())
            {
                scriptName = *v8::String::Utf8Value(isolate, script);
            }

            v8::Local<v8::String> func = frame->GetFunctionName();
            std::string funcName;
            if (!func.IsEmpty())
            {
                funcName = *v8::String::Utf8Value(isolate, func);
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

    void v8_isolate_promiseRejectCallback(v8::PromiseRejectMessage rejectMessage)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::HandleScope scope(isolate);

        switch (rejectMessage.GetEvent())
        {
        case v8::kPromiseRejectWithNoHandler:
        {
            v8::Local<v8::Message> message = v8::Exception::CreateMessage(isolate, rejectMessage.GetValue());
            printf(
                "%s\nSTACK:\n%s\n",
                *v8::String::Utf8Value{isolate, message->Get()},
                sugar::v8_stackTrace_toString(message->GetStackTrace()).c_str());
            break;
        }
        default:
        {
            throw "not yet implemented";
            break;
        }
        }
    }

    v8::MaybeLocal<v8::Module> v8_module_resolve(
        v8::Local<v8::Context> context,
        v8::Local<v8::String> specifier,
        v8::Local<v8::FixedArray> import_assertions,
        v8::Local<v8::Module> referrer)
    {
        static std::unordered_map<int, std::string> resolvedMap;

        v8::Isolate *isolate = context->GetIsolate();
        v8::EscapableHandleScope handle_scope(isolate);
        v8::Context::Scope context_scope(context);

        std::string file = *v8::String::Utf8Value(isolate, specifier);
        int count = 0;
        while (file.substr(0, 3) == "../")
        {
            file = file.substr(3);
            count += 1;
        }
        if (count > 0)
        {
            std::string ref = resolvedMap.find(referrer->GetIdentityHash())->second;
            while (count > -1)
            {
                int index = ref.rfind("/");
                ref = ref.substr(0, index);
                count--;
            }
            file = ref + "/" + file;
        }
        else if (file.substr(0, 2) == "./")
        {
            std::string ref = resolvedMap.find(referrer->GetIdentityHash())->second;
            ref = ref.substr(0, ref.rfind("/"));
            file = ref + "/" + file.substr(2);
        }

        auto it = moduleCache.find(file);
        if (it != moduleCache.end())
        {
            return handle_scope.EscapeMaybe(v8::MaybeLocal<v8::Module>{it->second.Get(isolate)});
        }

        auto res = sugar::sdl_rw_readUtf8(file.c_str());
        if (!res)
        {
            printf("module resolution failed to read the file '%s'\n", file.c_str());
            // isolate->ThrowException(v8::String::NewFromUtf8Literal(isolate, "module resolution error"));
            return {};
        }

        auto origin = v8::ScriptOrigin(isolate, v8::String::NewFromUtf8(isolate, file.c_str()).ToLocalChecked(), 0, 0, false, -1, v8::Local<v8::Value>(), false, false, true);
        v8::ScriptCompiler::Source source(v8::String::NewFromUtf8(isolate, res.get()).ToLocalChecked(), origin);
        auto maybeModule = v8::ScriptCompiler::CompileModule(isolate, &source);

        auto module = maybeModule.ToLocalChecked();
        resolvedMap.emplace(module->GetIdentityHash(), file);
        auto global = v8::Global<v8::Module>{isolate, module};
        global.SetWeak();
        moduleCache.emplace(file, std::move(global));

        return handle_scope.EscapeMaybe(maybeModule);
    }

    v8::MaybeLocal<v8::Module> v8_module_evaluate(v8::Local<v8::Context> context, v8::Local<v8::String> specifier)
    {
        v8::Isolate *isolate = context->GetIsolate();
        v8::EscapableHandleScope handle_scope(isolate);

        v8::TryCatch try_catch(isolate);
        auto maybeModule = sugar::v8_module_resolve(context, specifier);
        if (try_catch.HasCaught())
        {
            v8::Local<v8::Message> message = try_catch.Message();
            printf(
                "%s\nSTACK:\n%s\n",
                *v8::String::Utf8Value{isolate, message->Get()},
                sugar::v8_stackTrace_toString(message->GetStackTrace()).c_str()); // FIXME: stack trace is always empty here, why?
            return {};
        }
        if (maybeModule.IsEmpty())
        {
            printf("module resolve failed: %s\n", *v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        auto module = maybeModule.ToLocalChecked();
        // context->SetAlignedPointerInEmbedderData(1, &root);
        auto maybeOk = module->InstantiateModule(context, sugar::v8_module_resolve);
        if (try_catch.HasCaught())
        {
            v8::Local<v8::Message> message = try_catch.Message();
            printf(
                "%s\nSTACK:\n%s\n",
                *v8::String::Utf8Value{isolate, message->Get()},
                sugar::v8_stackTrace_toString(message->GetStackTrace()).c_str()); // FIXME: stack trace is always empty here, why?
            return {};
        }
        if (maybeOk.IsNothing())
        {
            printf("module instantiate failed: %s\n", *v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        v8::Local<v8::Promise> promise = module->Evaluate(context).ToLocalChecked().As<v8::Promise>();
        if (promise->State() != v8::Promise::kFulfilled)
        {
            printf("module evaluate failed: %s\n", *v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        return handle_scope.EscapeMaybe(maybeModule);
    }

    void v8_gc(v8::Local<v8::Context> context)
    {
        auto gc = sugar::v8_object_get<v8::Function>(context, context->Global(), "__gc__");
        gc->Call(context, context->Global(), 0, nullptr);
    }
}