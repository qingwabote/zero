%module puttyknife_forma_swig

%include <stdint.i>
%include "../jsb/bigint_ptr.i"

%bigint_ptr(float)
%bigint_ptr(forma::Mat4)

%include <forma/forma.h>

%{
#include <forma/forma.h>
%}