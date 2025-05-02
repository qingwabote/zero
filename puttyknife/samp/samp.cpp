#include <samp/samp.h>

samp::Clip *sampClip_new()
{
    return new samp::Clip();
}

void sampClip_addChannel(samp::Clip *self,
                         int path,
                         const float *const input_data,
                         const unsigned int input_length,
                         const float *const output_data
                         /* ,const unsigned int output_length */)
{
    self->addChannel(static_cast<samp::ChannelPath>(path), input_data, input_length, output_data, 0);
}

void sampClip_sample(samp::Clip *self, float *out, float time)
{
    self->sample(out, time);
}