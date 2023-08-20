%include <shared_ptr.i>

%define SWIG_SHARED_PTR_TYPEMAPS(CONST, TYPE...)
%typemap(in, noblock=1) std::shared_ptr<CONST TYPE> (std::shared_ptr<CONST TYPE> *temp = 0 ,int res = 0) {
  res = SWIG_ConvertPtr($input, &temp, $descriptor(TYPE *), 0 | %convertptr_flags);
  if (!SWIG_IsOK(res)) {
    if (res == SWIG_ERROR_RELEASE_NOT_OWNED) {
      %releasenotowned_fail(res, "TYPE *", $symname, $argnum);
    } else {
      %argument_fail(res, "TYPE *", $symname, $argnum);
    }
  }
  $1 = *temp;
}

%typemap(in, noblock=1) std::shared_ptr<CONST TYPE> * (int res = 0) {
  res = SWIG_ConvertPtr($input, &$1, $descriptor(TYPE *), 0 | %convertptr_flags);
  if (!SWIG_IsOK(res)) {
    if (res == SWIG_ERROR_RELEASE_NOT_OWNED) {
      %releasenotowned_fail(res, "TYPE *", $symname, $argnum);
    } else {
      %argument_fail(res, "TYPE *", $symname, $argnum);
    }
  }
}

%typemap(in, noblock=1) std::shared_ptr<CONST TYPE> & = std::shared_ptr<CONST TYPE> *;

%typemap (out) std::shared_ptr<CONST TYPE> %{
  %set_output(SWIG_NewPointerObj(SWIG_STD_MOVE($1), $descriptor(TYPE *), 0 | %newpointer_flags));
%}

%typemap (out) std::shared_ptr<CONST TYPE> * %{
  %set_output(SWIG_NewPointerObj(*$1, $descriptor(TYPE *), 0 | %newpointer_flags));
%}

%typemap (out) std::shared_ptr<CONST TYPE> & = std::shared_ptr<CONST TYPE> *;

%typemap(typecheck, precedence=SWIG_TYPECHECK_POINTER, equivalent="TYPE *", noblock=1) std::shared_ptr<CONST TYPE > {
  void *vptr = 0;
  int res = SWIG_ConvertPtr($input, &vptr, $descriptor(TYPE *), 0);
  $1 = SWIG_CheckState(res);
}

%template() std::shared_ptr<CONST TYPE >;
%enddef

namespace std {
  template <class T> class shared_ptr {};
}
