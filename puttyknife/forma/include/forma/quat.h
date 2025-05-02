#pragma once

namespace forma
{
    struct Quat
    {
        float data[4];

        float &operator[](int i)
        {
            return data[i];
        }

        float operator[](int i) const
        {
            return data[i];
        }
    };

    void slerp(Quat &out, const Quat &a, const Quat &b, float t);
}