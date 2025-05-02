#pragma once

#include "Clip.h"

#ifndef SAMP_EXPORT
#define SAMP_EXPORT
#endif

extern "C"
{
    SAMP_EXPORT samp::Clip *sampClip_new();
    SAMP_EXPORT void sampClip_addChannel(samp::Clip *self,
                                         int path,
                                         const float *const input_data,
                                         const unsigned int input_length,
                                         const float *const output_data
                                         /* ,const unsigned int output_length */);
    SAMP_EXPORT void sampClip_sample(samp::Clip *self, float *out, float time);
}