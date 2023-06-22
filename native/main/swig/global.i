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

%include "std_shared_ptr.i"
%shared_ptr(ImageBitmap)

// test 
%inline %{
void test_set_imageBitmap(std::shared_ptr<ImageBitmap> bitmap) {
}

std::shared_ptr<ImageBitmap> test_get_imageBitmap() {
  return std::make_shared<ImageBitmap>(std::unique_ptr<void, void (*)(void *)>(nullptr, free), 100, 100);
}

ImageBitmap * test_get_imageBitmap2() {
  return nullptr;
}
%}

%{
ImageBitmap * swig_imageBitmap_js2c(SWIGV8_VALUE js_obj) {
  void *p{nullptr};
  SWIG_ConvertPtr(js_obj, &p, SWIGTYPE_p_ImageBitmap, 0 | 0);
  return reinterpret_cast<ImageBitmap *>(p);
}
%}
