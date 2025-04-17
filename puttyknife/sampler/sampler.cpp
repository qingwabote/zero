#include <sampler/sampler.hpp>

#define EPSILON 1e-6f

int sampler_binarySearch(float *srcData, unsigned int srcLength, float value)
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

void sampler_vec3(float3 *out, float *inputData, unsigned int inputLength, float3 *output, float time)
{
    int index = sampler_binarySearch(inputData, inputLength, time);
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

void sampler_quat(float4 *out, float *inputData, unsigned int inputLength, float4 *output, float time)
{
    int index = sampler_binarySearch(inputData, inputLength, time);
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