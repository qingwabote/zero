#include <samp/Clip.h>
#include <forma/vec3.h>
#include <forma/quat.h>

#define EPSILON 1e-6f

namespace samp
{
    int seek(const float *srcData, unsigned int srcLength, float value)
    {
        if (value < srcData[0])
        {
            return 0;
        }

        if (value > srcData[srcLength - 1])
        {
            return srcLength - 1;
        }

        unsigned int head = 0;
        unsigned int tail = srcLength - 1;
        while (head <= tail)
        {
            unsigned int mid = (head + tail) >> 1;
            float res = srcData[mid];
            if ((value + EPSILON) < res)
            {
                tail = mid - 1;
            }
            else if ((value - EPSILON) > res)
            {
                head = mid + 1;
            }
            else
            {
                return mid;
            }
        }
        return ~head;
    }

    void vec3(forma::Vec3 *out, const float *inputData, unsigned int inputLength, const forma::Vec3 *output, float time)
    {
        int index = seek(inputData, inputLength, time);
        if (index >= 0)
        {
            *out = *(output + index);
        }
        else
        {
            int next = ~index;
            int prev = next - 1;

            float t = (time - inputData[prev]) / (inputData[next] - inputData[prev]);
            lerp(*out, *(output + prev), *(output + next), t);
        }
    }

    void quat(forma::Quat *out, const float *inputData, unsigned int inputLength, const forma::Quat *output, float time)
    {
        int index = seek(inputData, inputLength, time);
        if (index >= 0)
        {
            *out = *(output + index);
        }
        else
        {
            int next = ~index;
            int prev = next - 1;

            float t = (time - inputData[prev]) / (inputData[next] - inputData[prev]);
            slerp(*out, *(output + prev), *(output + next), t);
        }
    }

    int Channel::sample(float *out, float time)
    {
        switch (path)
        {
        case ChannelPath::TRANSLATION:
        case ChannelPath::SCALE:
            vec3(reinterpret_cast<forma::Vec3 *>(out), input_data, input_length, reinterpret_cast<const forma::Vec3 *>(output_data), time);
            return 3;
        case ChannelPath::ROTATION:
            quat(reinterpret_cast<forma::Quat *>(out), input_data, input_length, reinterpret_cast<const forma::Quat *>(output_data), time);
            return 4;

        default:
            std::abort();
        }
    }

    void Clip::addChannel(
        ChannelPath path,
        const float *const input_data,
        const unsigned int input_length,
        const float *const output_data,
        const unsigned int output_length)
    {
        _channels.emplace_back(path, input_data, input_length, output_data, output_length);
    }

    void Clip::sample(float *out, float time)
    {
        for (auto &&channel : _channels)
        {
            out += channel.sample(out, time);
        }
    }
}