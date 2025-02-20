cmake_minimum_required(VERSION 3.22)

project(spi-wasm)

set(CMAKE_C_FLAGS "-fno-exceptions -sSUPPORT_LONGJMP=0")

set(CMAKE_C_FLAGS_DEBUG "-g")
set(CMAKE_C_FLAGS_RELEASE "-O3 -flto")

add_executable(spi-wasm ./null.c)

add_subdirectory(../spi spi-build)
target_link_libraries(spi-wasm PRIVATE spi)

target_link_options(spi-wasm PRIVATE --no-entry "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free',\
    '_spiAnimationState_create','_spiAnimationState_dispose','_spiAnimationState_addAnimationByName','_spiAnimationState_update','_spiAnimationState_apply',\
    '_spiAtlas_create','_spiAtlas_getPages','_spiAtlasPage_getNext','_spiAtlasPage_getName','_spiAtlasPage_setRendererObject',\
    '_spiSubModel_getRange','_spiSubModel_getBlend','_spiSubModel_getRendererObject','_spiModel_create','_spiModel_dispose','_spiModel_getVerticesSize','_spiModel_getVertices','_spiModel_getIndicesSize','_spiModel_getIndices','_spiModel_getSubModelsSize','_spiModel_getSubModels','_spiModel_update',\
    '_spiSkeleton_create','_spiSkeleton_dispose','_spiSkeleton_update',\
    '_spiSkeletonBinary_create','_spiSkeletonBinary_getError','_spiSkeletonBinary_dispose','_spiSkeletonBinary_setScale','_spiSkeletonBinary_readSkeletonData'\
]")
set_target_properties(spi-wasm PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME spi)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")