#pragma once

#include <vector>

namespace samp
{
    enum class ChannelPath
    {
        TRANSLATION,
        ROTATION,
        SCALE,
        WEIGHTS
    };

    class Channel
    {
    public:
        const ChannelPath path;

        /* a set of floating-point scalar values representing linear time in seconds */
        const float *const input_data;
        const unsigned int input_length;

        /* a set of vectors or scalars representing the animated property */
        const float *const output_data;
        const unsigned int output_length;

        Channel(ChannelPath path,
                const float *const input_data,
                const unsigned int input_length,
                const float *const output_data,
                const unsigned int output_length)
            : path(path),
              input_data(input_data),
              input_length(input_length),
              output_data(output_data),
              output_length(output_length) {};

        int sample(float *out, float time);
    };

    class Clip
    {
    private:
        std::vector<Channel> _channels;

    public:
        void addChannel(
            ChannelPath path,
            const float *const input_data,
            const unsigned int input_length,
            const float *const output_data,
            const unsigned int output_length);

        void sample(float *out, float time);
    };
}