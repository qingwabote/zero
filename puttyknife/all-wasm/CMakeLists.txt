cmake_minimum_required(VERSION 3.22)

project(puttyknife)

set(CMAKE_CXX_FLAGS "-fno-exceptions -sSUPPORT_LONGJMP=0 -sDISABLE_EXCEPTION_CATCHING=1")

set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -flto")

add_executable(puttyknife ./malloc.cpp)

add_subdirectory(../forma/ forma)
target_compile_definitions(forma PRIVATE "FORMA_EXPORT=__attribute__((used))")
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive forma -Wl,--no-whole-archive)

add_subdirectory(../samp/ samp)
target_compile_definitions(samp PRIVATE "SAMP_EXPORT=__attribute__((used))")
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive samp -Wl,--no-whole-archive)

add_subdirectory(../phys-wasm/ phys-wasm)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive phys-wasm -Wl,--no-whole-archive)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive phys -Wl,--no-whole-archive)

add_subdirectory(../spi-wasm/ spi-wasm)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive spi-wasm -Wl,--no-whole-archive)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive spi -Wl,--no-whole-archive)

add_subdirectory(../yoga-wasm/ yoga-wasm)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive yoga-wasm -Wl,--no-whole-archive)
target_link_libraries(puttyknife PRIVATE -Wl,--whole-archive yoga-pk -Wl,--no-whole-archive)

target_link_options(puttyknife PRIVATE --no-entry -sFILESYSTEM=0 "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free',\
    '_YGNodeCalculateLayout','_YGNodeGetHasNewLayout','_YGNodeSetHasNewLayout','_YGNodeIsDirty','_YGNodeMarkDirty','_YGNodeInsertChild','_YGNodeSwapChild','_YGNodeRemoveChild','_YGNodeRemoveAllChildren','_YGNodeSetChildren','_YGNodeGetChild','_YGNodeGetChildCount','_YGNodeGetParent',\
    '_YGNodeStyleSetDirection','_YGNodeStyleGetDirection','_YGNodeStyleSetFlexDirection','_YGNodeStyleGetFlexDirection','_YGNodeStyleSetJustifyContent','_YGNodeStyleGetJustifyContent','_YGNodeStyleSetAlignContent','_YGNodeStyleGetAlignContent','_YGNodeStyleSetAlignItems','_YGNodeStyleGetAlignItems','_YGNodeStyleSetAlignSelf','_YGNodeStyleGetAlignSelf','_YGNodeStyleSetPositionType','_YGNodeStyleGetPositionType','_YGNodeStyleSetFlexWrap','_YGNodeStyleGetFlexWrap','_YGNodeStyleSetOverflow','_YGNodeStyleGetOverflow','_YGNodeStyleSetDisplay','_YGNodeStyleGetDisplay','_YGNodeStyleSetFlex','_YGNodeStyleGetFlex','_YGNodeStyleSetFlexGrow','_YGNodeStyleGetFlexGrow','_YGNodeStyleSetFlexShrink','_YGNodeStyleGetFlexShrink','_YGNodeStyleSetFlexBasis','_YGNodeStyleSetFlexBasisPercent','_YGNodeStyleSetFlexBasisAuto','_YGNodeStyleGetFlexBasis','_YGNodeStyleSetPosition','_YGNodeStyleSetPositionPercent','_YGNodeStyleGetPosition','_YGNodeStyleSetPositionAuto','_YGNodeStyleSetMargin','_YGNodeStyleSetMarginPercent','_YGNodeStyleSetMarginAuto','_YGNodeStyleGetMargin','_YGNodeStyleSetPadding','_YGNodeStyleSetPaddingPercent','_YGNodeStyleGetPadding','_YGNodeStyleSetBorder','_YGNodeStyleGetBorder','_YGNodeStyleSetGap','_YGNodeStyleSetGapPercent','_YGNodeStyleGetGap','_YGNodeStyleSetBoxSizing','_YGNodeStyleGetBoxSizing','_YGNodeStyleSetWidth','_YGNodeStyleSetWidthPercent','_YGNodeStyleSetWidthAuto','_YGNodeStyleGetWidth','_YGNodeStyleSetHeight','_YGNodeStyleSetHeightPercent','_YGNodeStyleSetHeightAuto','_YGNodeStyleGetHeight','_YGNodeStyleSetMinWidth','_YGNodeStyleSetMinWidthPercent','_YGNodeStyleGetMinWidth','_YGNodeStyleSetMinHeight','_YGNodeStyleSetMinHeightPercent','_YGNodeStyleGetMinHeight','_YGNodeStyleSetMaxWidth','_YGNodeStyleSetMaxWidthPercent','_YGNodeStyleGetMaxWidth','_YGNodeStyleSetMaxHeight','_YGNodeStyleSetMaxHeightPercent','_YGNodeStyleGetMaxHeight','_YGNodeStyleSetAspectRatio','_YGNodeStyleGetAspectRatio',\
    '_YGNodeLayoutGetLeft','_YGNodeLayoutGetTop','_YGNodeLayoutGetRight','_YGNodeLayoutGetBottom','_YGNodeLayoutGetWidth','_YGNodeLayoutGetHeight','_YGNodeLayoutGetDirection','_YGNodeLayoutGetHadOverflow','_YGNodeLayoutGetMargin','_YGNodeLayoutGetBorder','_YGNodeLayoutGetPadding'\
]")
set_target_properties(puttyknife PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME puttyknife)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")