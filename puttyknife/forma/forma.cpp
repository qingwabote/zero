#include <forma/forma.h>

void formaMat4_multiply_affine(forma::Mat4 *out, forma::Mat4 *a, forma::Mat4 *b)
{
    forma::multiply_affine(*out, *a, *b);
}
