#include <forma/mat4.h>

namespace forma
{
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
