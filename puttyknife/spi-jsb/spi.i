%module spi_jsb

%include <stdint.i>
%include "../jsb/bigint_ptr.i"

%typemap(in) const char * {
    uint64_t address = $input.As<v8::BigInt>()->Uint64Value();
    $1 = reinterpret_cast<char *>(address);
}
%typemap(freearg) const char * {}
%typemap(out) const char * {
    uint64_t address = reinterpret_cast<uint64_t>($1);
    $result = v8::BigInt::NewFromUnsigned(v8::Isolate::GetCurrent(), address);
}

%typemap(in) const unsigned char * {
    uint64_t address = $input.As<v8::BigInt>()->Uint64Value();
    $1 = reinterpret_cast<unsigned char *>(address);
}
%typemap(out) const unsigned char * {
    uint64_t address = reinterpret_cast<uint64_t>($1);
    $result = v8::BigInt::NewFromUnsigned(v8::Isolate::GetCurrent(), address);
}

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