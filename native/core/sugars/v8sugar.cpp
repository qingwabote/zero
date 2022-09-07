#include "v8sugar.hpp"
#include "libplatform/libplatform.h"
#include "sdlsugar.hpp"
#include <sstream>
#include <unordered_map>
#include <map>

namespace
{
    const uint32_t SLOT_CONSTRUCTOR_CACHE = 0;

    const uint32_t SLOT_MODULE_CACHE = 1;

    const uint32_t SLOT_WEAK_CALLBACKS = 2;

    std::unordered_map<std::string, _v8::Global<_v8::Module>> *isolate_getModuleCache(_v8::Isolate *isolate)
    {
        return (std::unordered_map<std::string, _v8::Global<_v8::Module>> *)isolate->GetData(SLOT_MODULE_CACHE);
    }

    struct SetWeakCallback;

    std::map<uint32_t, SetWeakCallback *> *isolate_getWeakCallbacks(_v8::Isolate *isolate)
    {
        return (std::map<uint32_t, SetWeakCallback *> *)isolate->GetData(SLOT_WEAK_CALLBACKS);
    }

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
                    isolate_getWeakCallbacks(info.GetIsolate())->erase(p->older());
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

namespace _v8 = v8;

namespace sugar
{
    namespace v8
    {
        static void isolateDeleter(_v8::Isolate *isolate)
        {
            for (auto &it : *isolate_getConstructorCache(isolate))
            {
                it.second.Reset();
            }
            for (auto &it : *isolate_getModuleCache(isolate))
            {
                it.second.Reset();
            }
            auto weakCallbacks = isolate_getWeakCallbacks(isolate);
            for (auto it = weakCallbacks->rbegin(); it != weakCallbacks->rend(); it++)
            {
                delete it->second;
            }
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
            isolate->SetData(SLOT_CONSTRUCTOR_CACHE, new std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>>);
            isolate->SetData(SLOT_MODULE_CACHE, new std::unordered_map<std::string, _v8::Global<_v8::Module>>);
            isolate->SetData(SLOT_WEAK_CALLBACKS, new std::map<uint32_t, SetWeakCallback *>);
            return unique_isolate{isolate, isolateDeleter};
        }

        std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> *isolate_getConstructorCache(_v8::Isolate *isolate)
        {
            return static_cast<std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> *>(isolate->GetData(SLOT_CONSTRUCTOR_CACHE));
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

        void isolate_promiseRejectCallback(_v8::PromiseRejectMessage rejectMessage)
        {
            _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
            _v8::HandleScope scope(isolate);

            switch (rejectMessage.GetEvent())
            {
            case _v8::kPromiseRejectWithNoHandler:
            {
                _v8::Local<_v8::Message> message = _v8::Exception::CreateMessage(isolate, rejectMessage.GetValue());
                printf(
                    "%s\nSTACK:\n%s\n",
                    *_v8::String::Utf8Value{isolate, message->Get()},
                    stackTrace_toString(message->GetStackTrace()).c_str());
                break;
            }
            default:
            {
                throw "not yet implemented";
                break;
            }
            }
        }

        _v8::MaybeLocal<_v8::Module> module_resolve(
            _v8::Local<_v8::Context> context,
            _v8::Local<_v8::String> specifier,
            _v8::Local<_v8::FixedArray> import_assertions,
            _v8::Local<_v8::Module> referrer)
        {
            static std::unordered_map<int, std::string> resolvedMap;

            _v8::Isolate *isolate = context->GetIsolate();
            _v8::EscapableHandleScope handle_scope(isolate);
            _v8::Context::Scope context_scope(context);

            std::string file = *_v8::String::Utf8Value(isolate, specifier);
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

            auto moduleCache = isolate_getModuleCache(isolate);
            auto it = moduleCache->find(file);
            if (it != moduleCache->end())
            {
                return handle_scope.EscapeMaybe(_v8::MaybeLocal<_v8::Module>{it->second.Get(isolate)});
            }

            auto res = sugar::sdl::rw_readUtf8(file.c_str());
            if (!res)
            {
                std::string exception{"module resolve failed to read the file: " + file};
                isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, exception.c_str()).ToLocalChecked()));
                return {};
            }

            auto origin = _v8::ScriptOrigin(isolate, _v8::String::NewFromUtf8(isolate, file.c_str()).ToLocalChecked(), 0, 0, false, -1, _v8::Local<_v8::Value>(), false, false, true);
            _v8::ScriptCompiler::Source source(_v8::String::NewFromUtf8(isolate, res.get()).ToLocalChecked(), origin);
            auto maybeModule = _v8::ScriptCompiler::CompileModule(isolate, &source);

            auto module = maybeModule.ToLocalChecked();
            resolvedMap.emplace(module->GetIdentityHash(), file);
            auto global = _v8::Global<_v8::Module>{isolate, module};
            global.SetWeak();
            moduleCache->emplace(file, std::move(global));

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
                _v8::Local<_v8::Message> message = try_catch.Message();
                printf(
                    "%s\nSTACK:\n%s\n",
                    *_v8::String::Utf8Value{isolate, message->Get()},
                    stackTrace_toString(message->GetStackTrace()).c_str()); // FIXME: stack trace is always empty here, why?
                return {};
            }
            if (maybeModule.IsEmpty())
            {
                printf("module resolve failed: %s\n", *_v8::String::Utf8Value(isolate, specifier));
                return {};
            }
            auto module = maybeModule.ToLocalChecked();
            // context->SetAlignedPointerInEmbedderData(1, &root);
            auto maybeOk = module->InstantiateModule(context, module_resolve);
            if (try_catch.HasCaught())
            {
                _v8::Local<_v8::Message> message = try_catch.Message();
                printf(
                    "%s\nSTACK:\n%s\n",
                    *_v8::String::Utf8Value{isolate, message->Get()},
                    stackTrace_toString(message->GetStackTrace()).c_str()); // FIXME: stack trace is always empty here, why?
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

        void setWeakCallback(_v8::Local<_v8::Data> obj, std::function<void()> &&cb)
        {
            _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
            auto callback = new SetWeakCallback(isolate, obj, std::forward<std::function<void()>>(cb));
            isolate_getWeakCallbacks(isolate)->emplace(callback->older(), callback);
        }

        void gc(_v8::Local<_v8::Context> context)
        {
            auto gc = object_get<_v8::Function>(context->Global(), "__gc__");
            gc->Call(context, context->Global(), 0, nullptr);
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

        Class::~Class()
        {
            _functionTemplate.Reset();
        }
    }
}
