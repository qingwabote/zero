%define %bigint_ptr(TYPE)

%typemap(in,noblock=1) TYPE* {
    $1 = reinterpret_cast<$1_ltype>($input.As<v8::BigInt>()->Uint64Value());
}
// override the default of char*
%typemap(freearg,noblock=1,match="in") TYPE* {}

%typemap (out,noblock=1) TYPE* {
    $result = v8::BigInt::NewFromUnsigned(v8::Isolate::GetCurrent(), reinterpret_cast<uint64_t>($1));
}

%enddef
