namespace sugar::v8
{
    template <class T>
    class Weak
    {
    private:
        _v8::Global<T> _global;

    public:
        inline bool IsEmpty() const { return _global.IsEmpty(); }

        Weak() {}

        Weak(_v8::Isolate *isolate, _v8::Local<T> that)
        {
            _global.Reset(isolate, that);
            _global.SetWeak();
        }

        inline _v8::Local<T> Get(_v8::Isolate *isolate) const
        {
            return _global.Get(isolate);
        }

        inline void Reset(_v8::Isolate *isolate, const _v8::Local<T> &that)
        {
            _global.Reset(isolate, that);
            _global.SetWeak();
        }

        inline bool operator==(const Weak<T> &that) const
        {
            return _global == that._global;
        }
    };
}
