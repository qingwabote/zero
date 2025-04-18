#pragma once

namespace samp
{
    struct Vec3
    {
        float data[3];

        float &operator[](int i)
        {
            return data[i];
        }
    };

    void lerp(Vec3 &out, Vec3 &a, Vec3 &b, float t);
}
