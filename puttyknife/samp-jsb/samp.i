%module puttyknife_samp_swig

%include <stdint.i>
%include "../jsb/bigint_ptr.i"

%bigint_ptr(float)
%bigint_ptr(samp::Vec3)
%bigint_ptr(samp::Quat)

%include <samp/samp.h>

%{
#include <samp/samp.h>
%}