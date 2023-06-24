%define %shared_ptr(TYPE)
%typemap(in, noblock=1) std::shared_ptr< TYPE > (int res = 0) {
  res = SWIG_ConvertPtr($input, $1, $descriptor(TYPE *), 0 | %convertptr_flags);
  if (!SWIG_IsOK(res)) {
    if (res == SWIG_ERROR_RELEASE_NOT_OWNED) {
      %releasenotowned_fail(res, "TYPE *", $symname, $argnum);
    } else {
      %argument_fail(res, "TYPE *", $symname, $argnum);
    }
  }
}

%typemap(in, noblock=1) std::shared_ptr< TYPE > & (std::shared_ptr< TYPE > temp, int res = 0) {
  res = SWIG_ConvertPtr($input, temp, $descriptor(TYPE *), 0 | %convertptr_flags);
  if (!SWIG_IsOK(res)) {
    if (res == SWIG_ERROR_RELEASE_NOT_OWNED) {
      %releasenotowned_fail(res, "TYPE *", $symname, $argnum);
    } else {
      %argument_fail(res, "TYPE *", $symname, $argnum);
    }
  }
  $1 = &temp;
}

%typemap (out) std::shared_ptr< TYPE > %{
  %set_output(SWIG_NewPointerObj(SWIG_STD_MOVE($1), $descriptor(TYPE *), 0 | %newpointer_flags));
%}

%typemap (out) std::shared_ptr< TYPE > & %{
  %set_output(SWIG_NewPointerObj(*$1, $descriptor(TYPE *), 0 | %newpointer_flags));
%}

%typemap(typecheck, precedence=SWIG_TYPECHECK_POINTER, equivalent="TYPE *", noblock=1) std::shared_ptr< TYPE > {
  void *vptr = 0;
  int res = SWIG_ConvertPtr($input, &vptr, $descriptor(TYPE *), 0);
  $1 = SWIG_CheckState(res);
}

%template() std::shared_ptr< TYPE >;
%enddef

namespace std {
  template <class T> class shared_ptr {};
}
