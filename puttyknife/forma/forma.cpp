#include <forma/forma.h>

void formaMat4_fromTRS(forma::Mat4 *out, forma::Vec3 *t, forma::Quat *r, forma::Vec3 *s)
{
    forma::fromTRS(*out, *t, *r, *s);
}

void formaMat4_multiply_affine(forma::Mat4 *out, forma::Mat4 *a, forma::Mat4 *b)
{
    forma::multiply_affine(*out, *a, *b);
}

void formaMat4_multiply_affine_TRS(forma::Mat4 *out, forma::Mat4 *m, forma::Vec3 *t, forma::Quat *r, forma::Vec3 *s)
{
    forma::Mat4 temp;
    forma::fromTRS(temp, *t, *r, *s);
    forma::multiply_affine(*out, *m, temp);
}
