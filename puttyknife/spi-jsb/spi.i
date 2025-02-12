%module puttyknife_spi_swig

%include <stdint.i>
%include "../jsb/bigint_ptr.i"

typedef int spBlendMode;

%ignore spiModel;
%ignore spiSubModel;

%bigint_ptr(const char)
%bigint_ptr(const unsigned char)
%bigint_ptr(float)
%bigint_ptr(unsigned short)

%bigint_ptr(spAnimationState)
%bigint_ptr(spTrackEntry)
%bigint_ptr(spSkeletonData)
%bigint_ptr(spAtlas)
%bigint_ptr(spAtlasPage)
%bigint_ptr(spSkeleton)
%bigint_ptr(spSkeletonBinary)

%bigint_ptr(spiModel)
%bigint_ptr(spiSubModel)
%bigint_ptr(spiSubModel*)

%include <spi/AnimationState.h>
%include <spi/Atlas.h>
%include <spi/Model.h>
%include <spi/Skeleton.h>
%include <spi/SkeletonBinary.h>

%{
#include <spi/AnimationState.h>
#include <spi/Atlas.h>
#include <spi/Model.h>
#include <spi/Skeleton.h>
#include <spi/SkeletonBinary.h>
%}