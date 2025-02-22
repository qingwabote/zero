# https://cmake.org/cmake/help/latest/policy/CMP0077.html#policy:CMP0077
set(BUILD_MULTITHREADING OFF CACHE BOOL "OFF Option BUILD_MULTITHREADING")
set(BUILD_EXTRAS OFF CACHE BOOL "OFF Option BUILD_EXTRAS")
set(USE_GLUT OFF CACHE BOOL "OFF Option USE_GLUT")

add_compile_definitions(BT_NO_PROFILE=1)

add_library(phys STATIC BoxShape.cpp CollisionObject.cpp CollisionShape.cpp Quat.cpp RigidBody.cpp Transform.cpp Vector3.cpp Vehicle.cpp World.cpp)
add_subdirectory(./bullet)
target_link_libraries(phys PRIVATE BulletDynamics BulletCollision LinearMath)
target_include_directories(phys PUBLIC ../public INTERFACE ../interface PRIVATE ./private ./bullet/src) 
