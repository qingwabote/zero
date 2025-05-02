#include <forma/vec3.h>

namespace forma
{
    void lerp(Vec3 &out, const Vec3 &a, const Vec3 &b, float t)
    {
        out[0] = a[0] + t * (b[0] - a[0]);
        out[1] = a[1] + t * (b[1] - a[1]);
        out[2] = a[2] + t * (b[2] - a[2]);
    }
}