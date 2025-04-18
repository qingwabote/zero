#pragma once

#include "vec3.h"
#include "quat.h"

#ifndef SAMP_EXPORT
#define SAMP_EXPORT
#endif

extern "C"
{
    SAMP_EXPORT void sampVec3(samp::Vec3 *out, float *inputData, unsigned int inputLength, samp::Vec3 *output, float time);
    SAMP_EXPORT void sampQuat(samp::Quat *out, float *inputData, unsigned int inputLength, samp::Quat *output, float time);
}