%define %bigint_ptr(TYPE)

%typemap(in) TYPE* {
    uint64_t address = $input.As<v8::BigInt>()->Uint64Value();
    $1 = reinterpret_cast<$1_ltype>(address);
}
// override the default of char*
%typemap(freearg,noblock=1,match="in") TYPE* {}

%typemap (out) TYPE* {
    uint64_t address = reinterpret_cast<uint64_t>($1);
    $result = v8::BigInt::NewFromUnsigned(v8::Isolate::GetCurrent(), address);
}

%enddef
