#include <samp/vec3.h>

namespace samp
{
    void lerp(Vec3 &out, Vec3 &a, Vec3 &b, float t)
    {
        out[0] = a[0] + t * (b[0] - a[0]);
        out[1] = a[1] + t * (b[1] - a[1]);
        out[2] = a[2] + t * (b[2] - a[2]);
    }
}