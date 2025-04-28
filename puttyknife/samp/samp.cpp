#include <samp/samp.h>

#define EPSILON 1e-6f

int sampSeek(float *srcData, unsigned int srcLength, float value)
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

void sampVec3(forma::Vec3 *out, float *inputData, unsigned int inputLength, forma::Vec3 *output, float time)
{
    int index = sampSeek(inputData, inputLength, time);
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

void sampQuat(forma::Quat *out, float *inputData, unsigned int inputLength, forma::Quat *output, float time)
{
    int index = sampSeek(inputData, inputLength, time);
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