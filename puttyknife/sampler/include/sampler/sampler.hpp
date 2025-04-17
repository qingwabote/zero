#pragma once

#include "float3.hpp"
#include "float4.hpp"

#ifndef SAMPLER_EXPORT
#define SAMPLER_EXPORT
#endif

extern "C"
{
    SAMPLER_EXPORT void sampler_vec3(float3 *out, float *inputData, unsigned int inputLength, float3 *output, float time);
    SAMPLER_EXPORT void sampler_quat(float4 *out, float *inputData, unsigned int inputLength, float4 *output, float time);
}