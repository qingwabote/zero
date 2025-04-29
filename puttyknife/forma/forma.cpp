#include <forma/forma.h>

void formaMat4_fromTRS(forma::Mat4 *out, forma::Vec3 *t, forma::Quat *r, forma::Vec3 *s)
{
    forma::fromTRS(*out, *t, *r, *s);
}

void formaMat4_multiply_affine(forma::Mat4 *out, forma::Mat4 *a, forma::Mat4 *b)
{
    forma::multiply_affine(*out, *a, *b);
}
