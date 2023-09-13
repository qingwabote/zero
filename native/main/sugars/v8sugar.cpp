#include "v8sugar.hpp"
#include "internal/v8/Weak.hpp"
#include "log.h"
#include <sstream>
#include <unordered_map>
#include <map>
#include <fstream>
#include <nlohmann/json.hpp>

void SWIGV8_DeletePrivateData(v8::Local<v8::Object> objRef);

namespace
{
    struct IsolateData
    {
    private:
        std::unordered_map<std::string, std::filesystem::path> _imports;

    public:
        std::unordered_map<std::string, std::filesystem::path> &imports()
        {
            return _imports;
        }

        IsolateData(std::unordered_map<std::string, std::filesystem::path> &imports)
        {
            _imports = imports;
        }

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

        std::unordered_map<const void *, _v8::Global<_v8::Object>> native2js;

        struct promise_hash
        {
            size_t operator()(const sugar::v8::Weak<_v8::Promise> &promise) const
            {
                return promise.Get(_v8::Isolate::GetCurrent())->GetIdentityHash();
            }
        };
        std::unordered_map<sugar::v8::Weak<_v8::Promise>, _v8::Global<_v8::Value>, promise_hash> promiseRejectMessages;
    };

    IsolateData *isolate_data(_v8::Isolate *isolate)
    {
        return static_cast<IsolateData *>(isolate->GetData(0));
    }

    void isolate_data(_v8::Isolate *isolate, IsolateData *data)
    {
        isolate->SetData(0, data);
    }
}

namespace sugar::v8
{
    static void isolate_deleter(_v8::Isolate *isolate)
    {
        IsolateData *data = isolate_data(isolate);
        {
            _v8::Isolate::Scope isolate_scope(isolate); // Isolate::GetCurrent() should be valid in SWIGV8_DeletePrivateData -> ~SWIGV8_Proxy() -> SWIGV8_ADJUST_MEMORY
            _v8::HandleScope handle_scope(isolate);
            for (auto &it : data->native2js)
            {
                SWIGV8_DeletePrivateData(it.second.Get(isolate));
            }
        }
        delete data;

        isolate->Dispose();
    }
    unique_isolate isolate_create(std::filesystem::path &imports_path)
    {
        std::error_code ec;
        std::uintmax_t size = std::filesystem::file_size(imports_path, ec);
        if (ec)
        {
            ZERO_LOG_ERROR("failed to get size of %s, %s", imports_path.string().c_str(), ec.message().c_str());
            return {nullptr, isolate_deleter};
        }

        std::unique_ptr<char[]> buffer{new char[size]};

        std::ifstream stream{imports_path, std::ios::binary};
        stream.read(buffer.get(), size);

        nlohmann::json imports_json;
        try
        {
            imports_json = nlohmann::json::parse(buffer.get(), buffer.get() + size);
        }
        catch (nlohmann::json::parse_error &e)
        {
            ZERO_LOG_ERROR("failed to parse %s %s", imports_path.string().c_str(), e.what());
            return {nullptr, isolate_deleter};
        }

        std::unordered_map<std::string, std::filesystem::path> imports;

        std::filesystem::current_path(imports_path.parent_path());
        for (auto &&i : imports_json.items())
        {
            std::filesystem::path path = i.value();
            std::error_code ec;
            path = std::filesystem::canonical(path, ec);
            if (ec)
            {
                ZERO_LOG_ERROR("%s", ec.message().c_str());
                return {nullptr, isolate_deleter};
            }
            imports.emplace(i.key(), path);
        }

        _v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<_v8::ArrayBuffer::Allocator>{_v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        _v8::Isolate *isolate = _v8::Isolate::New(create_params);

        isolate_data(isolate, new IsolateData(imports));

        return unique_isolate{isolate, isolate_deleter};
    }

    _v8::Local<_v8::Object> isolate_native2js_get(_v8::Isolate *isolate, const void *ptr)
    {
        auto &native2js = isolate_data(isolate)->native2js;
        auto it = native2js.find(ptr);
        if (it != native2js.end())
        {
            return it->second.Get(isolate);
        }
        return {};
    }

    void isolate_native2js_set(_v8::Isolate *isolate, const void *ptr, _v8::Local<_v8::Object> obj)
    {
        auto &native2js = isolate_data(isolate)->native2js;
        _v8::Global<_v8::Object> global(isolate, obj);
        global.SetWeak<void>(
            const_cast<void *>(ptr),
            [](const _v8::WeakCallbackInfo<void> &info)
            {
                isolate_data(info.GetIsolate())->native2js.erase(info.GetParameter());
            },
            _v8::WeakCallbackType::kParameter);
        native2js.emplace(ptr, std::move(global));
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

        auto &promiseRejectMessages = isolate_data(isolate)->promiseRejectMessages;
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
                auto &promiseRejectMessages = isolate_data(isolate)->promiseRejectMessages;
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
        _v8::Local<_v8::String> v8_specifier,
        _v8::Local<_v8::FixedArray> /*import_assertions*/,
        _v8::Local<_v8::Module> referrer)
    {
        _v8::Isolate *isolate = context->GetIsolate();
        _v8::EscapableHandleScope handle_scope(isolate);
        _v8::Context::Scope context_scope(context);

        const std::string specifier = *_v8::String::Utf8Value(isolate, v8_specifier);

        std::filesystem::path path;

        auto &imports = isolate_data(isolate)->imports();
        auto imports_it = imports.find(specifier);
        if (imports_it != imports.end())
        {
            path = imports_it->second;
        }
        else
        {
            path = specifier;
            if (!path.has_extension())
            {
                path.replace_extension("js");
            }
        }

        auto &module2path = isolate_data(isolate)->module2path;
        if (path.is_relative())
        {
            std::filesystem::current_path(module2path.find(Weak<_v8::Module>{isolate, referrer})->second.parent_path());
            std::error_code ec;
            auto res = std::filesystem::canonical(path, ec);
            if (ec)
            {
                std::string msg{"Failed to resolve module specifier \"" + specifier + "\""};
                isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                return {};
            }
            path = std::move(res);
        }

        auto &path2module = isolate_data(isolate)->path2module;
        auto it = path2module.find(path);
        if (it != path2module.end())
        {
            return handle_scope.EscapeMaybe(_v8::MaybeLocal<_v8::Module>{it->second.Get(isolate)});
        }

        std::error_code ec;
        std::uintmax_t size = std::filesystem::file_size(path, ec);
        if (ec)
        {
            std::string msg{"Failed to resolve module specifier \"" + specifier + "\""};
            isolate->ThrowException(_v8::Exception::Error(_v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
            return {};
        }

        std::unique_ptr<char[]> res{new char[size]};
        std::ifstream stream{path, std::ios::binary};
        stream.read(res.get(), size);

        auto origin = _v8::ScriptOrigin(isolate, _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked(), 0, 0, false, -1, _v8::Local<_v8::Value>(), false, false, true);
        _v8::ScriptCompiler::Source source(_v8::String::NewFromUtf8(isolate, res.get(), _v8::NewStringType::kNormal, size).ToLocalChecked(), origin);
        auto maybeModule = _v8::ScriptCompiler::CompileModule(isolate, &source);

        auto module = maybeModule.ToLocalChecked();
        module2path.emplace(Weak<_v8::Module>{isolate, module}, path);
        path2module.emplace(path, Weak<_v8::Module>{isolate, module});

        return handle_scope.EscapeMaybe(maybeModule);
    }

    void module_evaluate(_v8::Local<_v8::Context> context, const std::filesystem::path &path, _v8::Local<_v8::Promise> *out_promise, _v8::Local<_v8::Module> *out_module)
    {
        _v8::Isolate *isolate = context->GetIsolate();

        _v8::Global<_v8::Promise> g_promise;
        _v8::Global<_v8::Module> g_module;
        {
            _v8::HandleScope scope(isolate);

            _v8::TryCatch try_catch(isolate);
            _v8::MaybeLocal<_v8::Module> maybeModule = module_resolve(context, _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked(), {}, {});
            if (try_catch.HasCaught())
            {
                tryCatch_print(try_catch);
                return;
            }
            if (maybeModule.IsEmpty())
            {
                ZERO_LOG_ERROR("module resolve failed: %s", path.string().c_str());
                return;
            }
            auto module = maybeModule.ToLocalChecked();
            auto maybeOk = module->InstantiateModule(context, module_resolve);
            if (try_catch.HasCaught())
            {
                tryCatch_print(try_catch);
                return;
            }
            if (maybeOk.IsNothing())
            {
                ZERO_LOG_ERROR("module instantiate failed: %s", path.string().c_str());
                return;
            }
            g_promise.Reset(isolate, module->Evaluate(context).ToLocalChecked().As<_v8::Promise>());
            g_module.Reset(isolate, module);
        }
        if (out_module)
        {
            *out_module = g_module.Get(isolate);
        }
        *out_promise = g_promise.Get(isolate);
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

    const _v8::String::Utf8Value &object_toString(_v8::Local<_v8::Object> object)
    {
        _v8::Isolate *isolate = _v8::Isolate::GetCurrent();
        _v8::HandleScope scope{isolate};
        _v8::Local<_v8::Context> context = isolate->GetCurrentContext();

        return _v8::String::Utf8Value(isolate, _v8::JSON::Stringify(context, object, _v8::String::NewFromUtf8Literal(isolate, " ")).ToLocalChecked());
    }

    void gc(_v8::Local<_v8::Context> context)
    {
        auto gc = object_get(context->Global(), "__gc__").As<_v8::Function>();
        gc->Call(context, context->Global(), 0, nullptr).ToLocalChecked();
    }

    _v8::Local<_v8::Value> run(_v8::Local<_v8::Context> context, const std::filesystem::path &path)
    {
        std::error_code ec;
        std::uintmax_t size = std::filesystem::file_size(path, ec);
        if (ec)
        {
            ZERO_LOG_ERROR("failed to get size of %s, %s", path.string().c_str(), ec.message().c_str());
            return {};
        }

        std::unique_ptr<char[]> data{new char[size]};
        std::ifstream stream{path, std::ios::binary};
        stream.read(data.get(), size);

        _v8::Isolate *isolate = context->GetIsolate();
        _v8::EscapableHandleScope scope(isolate);

        _v8::TryCatch try_catch(isolate);
        auto maybeScript = _v8::Script::Compile(
            context,
            _v8::String::NewFromUtf8(isolate, data.get(), _v8::NewStringType::kNormal, size).ToLocalChecked(),
            &_v8::ScriptOrigin(isolate, _v8::String::NewFromUtf8(isolate, path.string().c_str()).ToLocalChecked()));
        if (try_catch.HasCaught())
        {
            tryCatch_print(try_catch);
            ZERO_LOG_ERROR("failed to compile %s", path.string().c_str());
            return {};
        }
        auto script = maybeScript.ToLocalChecked();
        auto maybeValue = script->Run(context);
        if (try_catch.HasCaught())
        {
            tryCatch_print(try_catch);
            return {};
        }
        return scope.Escape(maybeValue.ToLocalChecked());
    }
}
