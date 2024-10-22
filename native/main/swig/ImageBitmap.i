%module ImageBitmap

%include "attribute.i"

%{
#include "ImageBitmap.hpp"
%}

%ignore ImageBitmap::ImageBitmap;
%ignore ImageBitmap::pixels;

%include "ImageBitmap.hpp"