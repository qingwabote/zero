#pragma once

#include "vec3.h"
#include "quat.h"
#include "mat4.h"

#ifndef FORMA_EXPORT
#define FORMA_EXPORT
#endif

extern "C"
{
    FORMA_EXPORT void formaMat4_fromTRS(forma::Mat4 *out, forma::Vec3 *t, forma::Quat *r, forma::Vec3 *s);

    FORMA_EXPORT void formaMat4_multiply_affine(forma::Mat4 *out, forma::Mat4 *a, forma::Mat4 *b);

    FORMA_EXPORT void formaMat4_multiply_affine_TRS(forma::Mat4 *out, forma::Mat4 *m, forma::Vec3 *t, forma::Quat *r, forma::Vec3 *s);

    FORMA_EXPORT void formaMat4_to3x4(float *out, forma::Mat4 *m);
}
