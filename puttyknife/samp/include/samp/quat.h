#pragma once

namespace samp
{
    struct Quat
    {
        float data[4];

        float &operator[](int i)
        {
            return data[i];
        }
    };

    void slerp(Quat &out, Quat &a, Quat &b, float t);
}