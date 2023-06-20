%module global

%{
#include "Window.hpp"
%}

%{
static loader::Loader * Window_instance_loader() {
  return &Window::instance().loader();
}
%}

%constant loader::Loader *loader = Window_instance_loader();

// test 
%inline %{
ImageBitmap * test_image_js2c(ImageBitmap *bitmap) {
  return bitmap;
}
%}

%{
ImageBitmap * swig_imageBitmap_js2c(SWIGV8_VALUE js_obj) {
  void *p{nullptr};
  SWIG_ConvertPtr(js_obj, &p, SWIGTYPE_p_ImageBitmap, 0 | 0);
  return reinterpret_cast<ImageBitmap *>(p);
}
%}
