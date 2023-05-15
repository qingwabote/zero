#include "v8sugar.hpp"
#include "log.h"
#include <sstream>
#include <unordered_map>
#include <map>
#include <filesystem>
#include <fstream>

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

        // https://cplusplus.github.io/LWG/issue3657
        struct path_hash
        {
            size_t operator()(const std::filesystem::path &path) const
            {
                return std::filesystem::hash_value(path);
            }
        };

        std::unordered_map<std::filesystem::path, sugar::v8::Weak<_v8::Module>, path_hash> path2module;

        struct module_hash
        {
            size_t operator()(const sugar::v8::Weak<_v8::Module> &module) const
            {
                return module.Get(_v8::Isolate::GetCurrent())->GetIdentityHash();
            }
        };
        std::unordered_map<sugar::v8::Weak<_v8::Module>, std::filesystem::path, module_hash> module2path;

        std::map<uint32_t, SetWeakCallback *> weakCallbacks;

        struct promise_hash
        {
            size_t operator()(const sugar::v8::Weak<_v8::Promise> &promise) const
            {
                return promise.Get(_v8::Isolate::GetCurrent())->GetIdentityHash();
            }
        };
        std::unordered_map<sugar::v8::Weak<_v8::Promise>, _v8::Global<_v8::Value>, promise_hash> promiseRejectMessages;
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
        for (auto it = data->weakCallbacks.rbegin(); it != data->weakCallbacks.rend(); it++)
        {
            delete it->second;
        }
        delete data;

        isolate->Dispose();
    }
    unique_isolate initWithIsolate()
    {
        _v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<_v8::ArrayBuffer::Allocator>{_v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        _v8::Isolate *isolate = _v8::Isolate::New(create_params);

        // isolate->SetHostInitializeImportMetaObjectCallback(
        //     [](_v8::Local<_v8::Context> context,
        //        _v8::Local<_v8::Module> module,
        //        _v8::Local<_v8::Object> meta)
        //     {
        //         _v8::Isolate *isolate = context->GetIsolate();

        //         auto &module2path = IsolateData::getCurrent(isolate)->module2path;
        //         std::filesystem::path &path = module2path.find(module->GetIdentityHash())->second;
        //         object_set(meta, "url", _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked());
        //     });

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
        ZERO_LOG_ERROR(
            "%s\nSTACK:\n%s",
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
            promiseRejectMessages.emplace(Weak<_v8::Promise>{isolate, rejectMessage.GetPromise()},
                                          _v8::Global<_v8::Value>(isolate, rejectMessage.GetValue()));
            break;
        }
        case _v8::kPromiseHandlerAddedAfterReject:
            promiseRejectMessages.erase(Weak<_v8::Promise>{isolate, rejectMessage.GetPromise()});
            break;
        case _v8::kPromiseRejectAfterResolved:
        {
            _v8::Local<_v8::Message> message = _v8::Exception::CreateMessage(isolate, rejectMessage.GetValue());
            ZERO_LOG_ERROR("%s\nSTACK:\n%s",
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
                    ZERO_LOG_ERROR("%s\nSTACK:\n%s",
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
        _v8::Isolate *isolate = context->GetIsolate();
        _v8::EscapableHandleScope handle_scope(isolate);
        _v8::Context::Scope context_scope(context);

        auto &module2path = IsolateData::getCurrent(isolate)->module2path;
        std::filesystem::path path(*_v8::String::Utf8Value(isolate, specifier));
        if (path.is_relative())
        {
            std::filesystem::path &ref = module2path.find(Weak<_v8::Module>{isolate, referrer})->second;
            std::filesystem::current_path(ref.parent_path());
            std::error_code ec;
            path = std::filesystem::canonical(path, ec);
            if (ec)
            {
                std::string msg{ec.message() + ": " + path.string()};
                isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                return {};
            }
        }

        auto &path2module = IsolateData::getCurrent(isolate)->path2module;
        auto it = path2module.find(path);
        if (it != path2module.end())
        {
            return handle_scope.EscapeMaybe(_v8::MaybeLocal<_v8::Module>{it->second.Get(isolate)});
        }

        std::error_code ec;
        std::uintmax_t size = std::filesystem::file_size(path, ec);
        if (ec)
        {
            std::string msg{"module resolve failed to read the size of file: " + path.string()};
            isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
            return {};
        }

        auto res = std::unique_ptr<char, decltype(free) *>{(char *)malloc(size), free};
        std::ifstream is;
        is.open(path.string(), std::ios::binary);
        is.read(res.get(), size);

        auto origin = _v8::ScriptOrigin(isolate, _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked(), 0, 0, false, -1, _v8::Local<_v8::Value>(), false, false, true);
        _v8::ScriptCompiler::Source source(_v8::String::NewFromUtf8(isolate, res.get(), _v8::NewStringType::kNormal, size).ToLocalChecked(), origin);
        auto maybeModule = _v8::ScriptCompiler::CompileModule(isolate, &source);

        auto module = maybeModule.ToLocalChecked();
        module2path.emplace(Weak<_v8::Module>{isolate, module}, path);
        path2module.emplace(path, Weak<_v8::Module>{isolate, module});

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
            ZERO_LOG_ERROR("module resolve failed: %s", *_v8::String::Utf8Value(isolate, specifier));
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
            ZERO_LOG_ERROR("module instantiate failed: %s", *_v8::String::Utf8Value(isolate, specifier));
            return {};
        }
        _v8::Local<_v8::Promise> promise = module->Evaluate(context).ToLocalChecked().As<_v8::Promise>();
        if (promise->State() != _v8::Promise::kFulfilled)
        {
            ZERO_LOG_ERROR("module evaluate failed: %s", *_v8::String::Utf8Value(isolate, specifier));
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
        if (object->Get(context, _v8::String::NewFromUtf8(isolate, name).ToLocalChecked()).ToLocal(&out))
        {
            return handleScope.Escape(out);
        }
        return {};
    }

    void object_set(_v8::Local<_v8::Object> object, const char *name, _v8::Local<_v8::Value> value)
    {
        _v8::Isolate *isolate = object->GetIsolate();
        _v8::HandleScope handleScope(isolate);
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        object->Set(context, _v8::String::NewFromUtf8(isolate, name).ToLocalChecked(), value).ToChecked();
    }

    void ctor_name(_v8::Local<_v8::FunctionTemplate> ctor, const char *name)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        ctor->SetClassName(_v8::String::NewFromUtf8(isolate, name).ToLocalChecked());
    }

    void ctor_function(_v8::Local<_v8::FunctionTemplate> ctor, const char *name, _v8::FunctionCallback callback)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        ctor->PrototypeTemplate()->Set(isolate, name, _v8::FunctionTemplate::New(isolate, callback));
    }

    void ctor_accessor(_v8::Local<_v8::FunctionTemplate> ctor, const char *name, _v8::AccessorNameGetterCallback getter, _v8::AccessorNameSetterCallback setter)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        ctor->PrototypeTemplate()->SetAccessor(_v8::String::NewFromUtf8(isolate, name).ToLocalChecked(), getter, setter);
    }

    const _v8::String::Utf8Value &object_toString(_v8::Local<_v8::Object> object)
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
        gc->Call(context, context->Global(), 0, nullptr).ToLocalChecked();
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
}
