#include <sampler/float3.hpp>

void lerp(float3 &out, float3 &a, float3 &b, float t)
{
    out[0] = a[0] + t * (b[0] - a[0]);
    out[1] = a[1] + t * (b[1] - a[1]);
    out[2] = a[2] + t * (b[2] - a[2]);
}