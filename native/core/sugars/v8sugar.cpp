#include "v8sugar.hpp"
#include "libplatform/libplatform.h"
#include "sdlsugar.hpp"
#include <sstream>
#include <unordered_map>
#include <map>
#include <filesystem>

namespace
{
    struct SetWeakCallback;

    struct IsolateData
    {
        static IsolateData *getCurrent(_v8::Isolate *isolate)
        {
            return static_cast<IsolateData *>(isolate->GetData(0));
        }

        IsolateData(_v8::Isolate *isolate)
        {
            isolate->SetData(0, this);
        }

        std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> constructorCache;

        std::unordered_map<std::filesystem::path, _v8::Global<_v8::Module>> moduleCache;

        std::map<uint32_t, SetWeakCallback *> weakCallbacks;

        std::unordered_map<int, _v8::Global<_v8::Value>> promiseRejectMessages;
    };

    struct SetWeakCallback
    {
    private:
        uint32_t _older;

    public:
        _v8::Persistent<_v8::Data> ref;
        std::function<void()> callback;
        uint32_t older()
        {
            return _older;
        }

        SetWeakCallback(_v8::Isolate *isolate, _v8::Local<_v8::Data> obj, std::function<void()> &&cb)
        {
            ref.Reset(isolate, obj);
            callback = cb;

            ref.SetWeak<SetWeakCallback>(
                this,
                [](const _v8::WeakCallbackInfo<SetWeakCallback> &info)
                {
                    SetWeakCallback *p = info.GetParameter();
                    IsolateData::getCurrent(info.GetIsolate())->weakCallbacks.erase(p->older());
                    delete p;
                },
                _v8::WeakCallbackType::kParameter);

            static uint32_t count = 0;
            _older = ++count;
        }
        ~SetWeakCallback()
        {
            callback();
            ref.Reset();
        }
    };
}

namespace sugar::v8
{
    static void isolateDeleter(_v8::Isolate *isolate)
    {
        IsolateData *data = IsolateData::getCurrent(isolate);
        for (auto &it : data->constructorCache)
        {
            it.second.Reset();
        }
        for (auto &it : data->moduleCache)
        {
            it.second.Reset();
        }
        for (auto it = data->weakCallbacks.rbegin(); it != data->weakCallbacks.rend(); it++)
        {
            delete it->second;
        }
        delete data;

        isolate->Dispose();
        _v8::V8::Dispose();
        _v8::V8::DisposePlatform();
    }
    unique_isolate initWithIsolate()
    {
        _v8::V8::InitializePlatform(_v8::platform::NewDefaultPlatform().release());
        _v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
        _v8::V8::Initialize();

        _v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<_v8::ArrayBuffer::Allocator>{_v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        _v8::Isolate *isolate = _v8::Isolate::New(create_params);
        new IsolateData(isolate);
        return unique_isolate{isolate, isolateDeleter};
    }

    std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> *isolate_getConstructorCache(_v8::Isolate *isolate)
    {
        return &IsolateData::getCurrent(isolate)->constructorCache;
    }

    std::string stackTrace_toString(_v8::Local<_v8::StackTrace> stack)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _v8::HandleScope scope(isolate);

        std::string stackStr;
        if (stack.IsEmpty())
        {
            return stackStr;
        }

        char tmp[100] = {0};
        for (int i = 0, e = stack->GetFrameCount(); i < e; ++i)
        {
            _v8::Local<_v8::StackFrame> frame = stack->GetFrame(isolate, i);
            _v8::Local<_v8::String> script = frame->GetScriptName();
            std::string scriptName;
            if (!script.IsEmpty())
            {
                scriptName = *_v8::String::Utf8Value(isolate, script);
            }

            _v8::Local<_v8::String> func = frame->GetFunctionName();
            std::string funcName;
            if (!func.IsEmpty())
            {
                funcName = *_v8::String::Utf8Value(isolate, func);
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

    void tryCatch_print(_v8::TryCatch &tryCatch)
    {
        _v8::Local<_v8::Message> message = tryCatch.Message();
        printf(
            "%s\nSTACK:\n%s\n",
            *_v8::String::Utf8Value{message->GetIsolate(), message->Get()},
            stackTrace_toString(message->GetStackTrace()).c_str());
    }

    void isolate_promiseRejectCallback(_v8::PromiseRejectMessage rejectMessage)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();

        auto &promiseRejectMessages = IsolateData::getCurrent(isolate)->promiseRejectMessages;
        switch (rejectMessage.GetEvent())
        {
        case _v8::kPromiseRejectWithNoHandler:
        {
            promiseRejectMessages.emplace(rejectMessage.GetPromise()->GetIdentityHash(),
                                          _v8::Global<_v8::Value>(isolate, rejectMessage.GetValue()));
            break;
        }
        case _v8::kPromiseHandlerAddedAfterReject:
            promiseRejectMessages.erase(rejectMessage.GetPromise()->GetIdentityHash());
            break;
        case _v8::kPromiseRejectAfterResolved:
        {
            _v8::Local<_v8::Message> message = _v8::Exception::CreateMessage(isolate, rejectMessage.GetValue());
            printf("%s\nSTACK:\n%s\n",
                   *_v8::String::Utf8Value{isolate, message->Get()},
                   stackTrace_toString(message->GetStackTrace()).c_str());
            break;
        }
        case _v8::kPromiseResolveAfterResolved:
            throw "not implemented yet";
            break;
        }

        isolate->EnqueueMicrotask(
            [](void *p)
            {
                _v8::Isolate *isolate = static_cast<_v8::Isolate *>(p);
                auto &promiseRejectMessages = IsolateData::getCurrent(isolate)->promiseRejectMessages;
                for (auto &it : promiseRejectMessages)
                {
                    _v8::Local<_v8::Message> message = _v8::Exception::CreateMessage(isolate, it.second.Get(isolate));
                    printf("%s\nSTACK:\n%s\n",
                           *_v8::String::Utf8Value{isolate, message->Get()},
                           stackTrace_toString(message->GetStackTrace()).c_str());
                }
                promiseRejectMessages.clear();
            },
            isolate);
    }

    _v8::MaybeLocal<_v8::Module> module_resolve(
        _v8::Local<_v8::Context> context,
        _v8::Local<_v8::String> specifier,
        _v8::Local<_v8::FixedArray> import_assertions,
        _v8::Local<_v8::Module> referrer)
    {
        static std::unordered_map<int, std::filesystem::path> resolvedMap;

        _v8::Isolate *isolate = context->GetIsolate();
        _v8::EscapableHandleScope handle_scope(isolate);
        _v8::Context::Scope context_scope(context);

        std::filesystem::path path(*_v8::String::Utf8Value(isolate, specifier));
        if (path.is_relative())
        {
            std::filesystem::path &ref = resolvedMap.find(referrer->GetIdentityHash())->second;
            std::filesystem::current_path(ref.parent_path());
            path = std::filesystem::absolute(path);
        }

        auto &moduleCache = IsolateData::getCurrent(isolate)->moduleCache;
        auto it = moduleCache.find(path);
        if (it != moduleCache.end())
        {
            return handle_scope.EscapeMaybe(_v8::MaybeLocal<_v8::Module>{it->second.Get(isolate)});
        }

        auto res = sugar::sdl::rw_readUtf8(path.string().c_str());
        if (!res)
        {
            std::string exception{"module resolve failed to read the file: " + path.string()};
            isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, exception.c_str()).ToLocalChecked()));
            return {};
        }

        auto origin = _v8::ScriptOrigin(isolate, _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked(), 0, 0, false, -1, _v8::Local<_v8::Value>(), false, false, true);
        _v8::ScriptCompiler::Source source(_v8::String::NewFromUtf8(isolate, res.get()).ToLocalChecked(), origin);
        auto maybeModule = _v8::ScriptCompiler::CompileModule(isolate, &source);

        auto module = maybeModule.ToLocalChecked();
        resolvedMap.emplace(module->GetIdentityHash(), path);
        auto global = _v8::Global<_v8::Module>{isolate, module};
        global.SetWeak();
        moduleCache.emplace(path, std::move(global));

        return handle_scope.EscapeMaybe(maybeModule);
    }

    _v8::MaybeLocal<_v8::Module> module_evaluate(_v8::Local<_v8::Context> context, _v8::Local<_v8::String> specifier)
    {
        _v8::Isolate *isolate = context->GetIsolate();
        _v8::EscapableHandleScope handle_scope(isolate);

        _v8::TryCatch try_catch(isolate);
        auto maybeModule = module_resolve(context, specifier);
        if (try_catch.HasCaught())
        {
            tryCatch_print(try_catch);
            return {};
        }
        if (maybeModule.IsEmpty())
        {
            printf("module resolve failed: %s\n", *_v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        auto module = maybeModule.ToLocalChecked();
        auto maybeOk = module->InstantiateModule(context, module_resolve);
        if (try_catch.HasCaught())
        {
            tryCatch_print(try_catch);
            return {};
        }
        if (maybeOk.IsNothing())
        {
            printf("module instantiate failed: %s\n", *_v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        _v8::Local<_v8::Promise> promise = module->Evaluate(context).ToLocalChecked().As<_v8::Promise>();
        if (promise->State() != _v8::Promise::kFulfilled)
        {
            printf("module evaluate failed: %s\n", *_v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        return handle_scope.EscapeMaybe(maybeModule);
    }

    _v8::Local<_v8::Value> object_get(_v8::Local<_v8::Object> object, const char *name)
    {
        _v8::Isolate *isolate = object->GetIsolate();
        _v8::EscapableHandleScope handleScope(isolate);
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        _v8::Local<_v8::Value> out;
        object->Get(context, _v8::String::NewFromUtf8(isolate, name).ToLocalChecked()).ToLocal(&out);
        return handleScope.Escape(out);
    }

    void object_set(_v8::Local<_v8::Object> object, const char *name, _v8::Local<_v8::Value> value)
    {
        _v8::Isolate *isolate = object->GetIsolate();
        _v8::HandleScope handleScope(isolate);
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        object->Set(context, _v8::String::NewFromUtf8(isolate, name).ToLocalChecked(), value);
    }

    _v8::String::Utf8Value &object_toString(_v8::Local<_v8::Object> object)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _v8::HandleScope scope{isolate};
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        return _v8::String::Utf8Value(isolate, _v8::JSON::Stringify(context, object, _v8::String::NewFromUtf8Literal(isolate, " ")).ToLocalChecked());
    }

    void setWeakCallback(_v8::Local<_v8::Data> obj, std::function<void()> &&cb)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        auto callback = new SetWeakCallback(isolate, obj, std::forward<std::function<void()>>(cb));
        IsolateData::getCurrent(isolate)->weakCallbacks.emplace(callback->older(), callback);
    }

    void gc(_v8::Local<_v8::Context> context)
    {
        auto gc = object_get(context->Global(), "__gc__").As<_v8::Function>();
        gc->Call(context, context->Global(), 0, nullptr);
    }

    _v8::Local<_v8::Value> run(const char *source)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _v8::EscapableHandleScope scope(isolate);
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        _v8::TryCatch try_catch(isolate);
        _v8::Local<_v8::Script> script;
        if (!_v8::Script::Compile(context, _v8::String::NewFromUtf8(isolate, source).ToLocalChecked()).ToLocal(&script))
        {
            tryCatch_print(try_catch);
            return {};
        }
        _v8::Local<_v8::Value> result;
        if (!script->Run(context).ToLocal(&result))
        {
            tryCatch_print(try_catch);
            return {};
        }
        return scope.Escape(result);
    }

    Class::Class(const char *name)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _v8::HandleScope scope(isolate);

        _v8::Local<_v8::FunctionTemplate> constructor{_v8::FunctionTemplate::New(isolate)};
        constructor->SetClassName(_v8::String::NewFromUtf8(isolate, name).ToLocalChecked());
        constructor->InstanceTemplate()->SetInternalFieldCount(1);

        _functionTemplate.Reset(isolate, constructor);
    }

    void Class::defineFunction(const char *name, _v8::FunctionCallback callback)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _functionTemplate.Get(isolate)->PrototypeTemplate()->Set(isolate, name, _v8::FunctionTemplate::New(isolate, callback));
    }

    void Class::defineAccessor(const char *name, _v8::AccessorNameGetterCallback getter, _v8::AccessorNameSetterCallback setter)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _functionTemplate.Get(isolate)->PrototypeTemplate()->SetAccessor(_v8::String::NewFromUtf8(isolate, name).ToLocalChecked(), getter, setter);
    }

    _v8::Local<_v8::FunctionTemplate> Class::flush()
    {
        return _functionTemplate.Get(_v8::Isolate::GetCurrent());
    }
}