cmake_minimum_required(VERSION 3.22)

project(cmake-proj)

add_executable(cmake-proj ./cmake-proj.c)

add_subdirectory(./sub)
target_compile_options(sub-proj PRIVATE -g)
# -Wl,<options> ：将逗号分隔的 <options> 传递给链接器
# --whole-archive的作用是将liba.a中的所有目标文件中的符号都链接到可执行文件，不管用不用
# --no-whole-archive是它的配对，要一起使用，表示选项的作用到此结束，避免影响其他库的链接规则
# Starting with cmake 3.24, use LINK_LIBRARY:WHOLE_ARCHIVE instead.
# target_link_libraries(cmake-proj PRIVATE -Wl,--whole-archive sub-proj -Wl,--no-whole-archive)
target_link_libraries(cmake-proj PRIVATE sub-proj)

target_link_options(cmake-proj PRIVATE -g -sEXPORT_ES6=1 -sEXPORTED_FUNCTIONS=['_malloc','_free','_getString','_setString'] -sEXPORTED_RUNTIME_METHODS=['ccall','cwrap'])

# set(EMS_LINK_FLAGS "-gsource-map")

# set_target_properties(cmake-proj PROPERTIES LINK_FLAGS ${EMS_LINK_FLAGS})