#pragma once

#include <forma/vec3.h>
#include <forma/quat.h>

#ifndef SAMP_EXPORT
#define SAMP_EXPORT
#endif

extern "C"
{
    SAMP_EXPORT void sampVec3(forma::Vec3 *out, float *inputData, unsigned int inputLength, forma::Vec3 *output, float time);
    SAMP_EXPORT void sampQuat(forma::Quat *out, float *inputData, unsigned int inputLength, forma::Quat *output, float time);
}