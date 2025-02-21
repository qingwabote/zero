#include <phys/BoxShape.hpp>

phys::BoxShape *physBoxShape_new()
{
    // using unit-scale shape https://pybullet.org/Bullet/phpBB3/viewtopic.php?p=20760#p20760
    btVector3 v3(0.5, 0.5, 0.5);
    return new btBoxShape(v3);
}