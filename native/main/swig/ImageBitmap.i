%module ImageBitmap

%include "attribute.i"

%{
#include "ImageBitmap.hpp"
%}

%ignore ImageBitmap::ImageBitmap;
%ignore ImageBitmap::pixels;

%attribute(ImageBitmap, int, width, width);
%attribute(ImageBitmap, int, height, height);

%include "ImageBitmap.hpp"