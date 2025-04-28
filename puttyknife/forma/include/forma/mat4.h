#pragma once

namespace forma
{
    struct Mat4
    {
        float data[16];

        float &operator[](int i)
        {
            return data[i];
        }
    };

    void multiply_affine(forma::Mat4 &out, forma::Mat4 &a, forma::Mat4 &b);
}
