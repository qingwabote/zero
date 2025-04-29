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

    void fromTRS(forma::Mat4 &out, forma::Vec3 &t, forma::Quat &r, forma::Vec3 &s);

    void multiply_affine(forma::Mat4 &out, forma::Mat4 &a, forma::Mat4 &b);
}
