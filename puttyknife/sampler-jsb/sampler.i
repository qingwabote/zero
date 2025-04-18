%module puttyknife_sampler_swig

%include <stdint.i>
%include "../jsb/bigint_ptr.i"

%bigint_ptr(float)
%bigint_ptr(float3)
%bigint_ptr(float4)

%include <sampler/sampler.hpp>

%{
#include <sampler/sampler.hpp>
%}