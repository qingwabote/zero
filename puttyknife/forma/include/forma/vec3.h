#pragma once

namespace forma
{
    struct Vec3
    {
        float data[3];

        float &operator[](int i)
        {
            return data[i];
        }

        float operator[](int i) const
        {
            return data[i];
        }
    };

    void lerp(Vec3 &out, const Vec3 &a, const Vec3 &b, float t);
}
