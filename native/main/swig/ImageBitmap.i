%module ImageBitmap

%include "attribute.i"

%ignore ImageBitmap::ImageBitmap;
%ignore ImageBitmap::pixels;

%{
#include <gfx/ImageBitmap.hpp>
%}
%include <gfx/ImageBitmap.hpp>