set(BUILD_MULTITHREADING OFF)
set(BUILD_EXTRAS OFF)
set(USE_GLUT OFF)

add_compile_definitions(BT_NO_PROFILE=1)

add_library(phys STATIC BoxShape.cpp CollisionShape.cpp Quat.cpp RigidBody.cpp Transform.cpp Vector3.cpp World.cpp)
add_subdirectory(./bullet)
target_link_libraries(phys PRIVATE BulletDynamics BulletCollision LinearMath)
target_include_directories(phys PUBLIC ../public INTERFACE ../interface PRIVATE ./private ./bullet/src) 
