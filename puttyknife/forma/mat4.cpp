#include <forma/vec3.h>
#include <forma/quat.h>
#include <forma/mat4.h>

namespace forma
{
    void fromTRS(forma::Mat4 &out, forma::Vec3 &t, forma::Quat &r, forma::Vec3 &s)
    {
        float x = r[0];
        float y = r[1];
        float z = r[2];
        float w = r[3];
        float x2 = x + x;
        float y2 = y + y;
        float z2 = z + z;

        float xx = x * x2;
        float xy = x * y2;
        float xz = x * z2;
        float yy = y * y2;
        float yz = y * z2;
        float zz = z * z2;
        float wx = w * x2;
        float wy = w * y2;
        float wz = w * z2;
        float sx = s[0];
        float sy = s[1];
        float sz = s[2];

        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = t[0];
        out[13] = t[1];
        out[14] = t[2];
        out[15] = 1;
    }

    void multiply_affine(forma::Mat4 &out, forma::Mat4 &a, forma::Mat4 &b)
    {
        float a00 = a[0], a01 = a[1], a02 = a[2],
              a04 = a[4], a05 = a[5], a06 = a[6],
              a08 = a[8], a09 = a[9], a10 = a[10],
              a12 = a[12], a13 = a[13], a14 = a[14];

        float x = b[0];
        float y = b[1];
        float z = b[2];
        out[0] = x * a00 + y * a04 + z * a08;
        out[1] = x * a01 + y * a05 + z * a09;
        out[2] = x * a02 + y * a06 + z * a10;

        x = b[4];
        y = b[5];
        z = b[6];
        out[4] = x * a00 + y * a04 + z * a08;
        out[5] = x * a01 + y * a05 + z * a09;
        out[6] = x * a02 + y * a06 + z * a10;

        x = b[8];
        y = b[9];
        z = b[10];
        out[8] = x * a00 + y * a04 + z * a08;
        out[9] = x * a01 + y * a05 + z * a09;
        out[10] = x * a02 + y * a06 + z * a10;

        x = b[12];
        y = b[13];
        z = b[14];
        out[12] = x * a00 + y * a04 + z * a08 + a12;
        out[13] = x * a01 + y * a05 + z * a09 + a13;
        out[14] = x * a02 + y * a06 + z * a10 + a14;
    }
}
