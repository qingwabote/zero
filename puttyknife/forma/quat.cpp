#include <forma/quat.h>
#include <math.h>

namespace forma
{
    void slerp(Quat &out, Quat const &a, const Quat &b, float t)
    {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations

        float scale0 = 0;
        float scale1 = 0;
        float bx = b[0];
        float by = b[1];
        float bz = b[2];
        float bw = b[3];

        // calc cosine
        float cosom = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        // adjust signs (if necessary)
        if (cosom < 0.0)
        {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if ((1.0 - cosom) > 0.000001)
        {
            // standard case (slerp)
            float omega = acosf(cosom);
            float sinom = sinf(omega);
            scale0 = sinf((1.0 - t) * omega) / sinom;
            scale1 = sinf(t * omega) / sinom;
        }
        else
        {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out[0] = scale0 * a[0] + scale1 * bx;
        out[1] = scale0 * a[1] + scale1 * by;
        out[2] = scale0 * a[2] + scale1 * bz;
        out[3] = scale0 * a[3] + scale1 * bw;
    }
}