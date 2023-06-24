%module global

%include "std_shared_ptr.i"
%include "std_vector.i"

%{
#include "Window.hpp"
%}

%{
static loader::Loader * Window_instance_loader() {
  return &Window::instance().loader();
}
%}

%constant loader::Loader *loader = Window_instance_loader();

%shared_ptr(ImageBitmap)

%template(ImageBitmapVector) std::vector<std::shared_ptr<ImageBitmap>>;

%shared_ptr(std::vector<std::shared_ptr<ImageBitmap>>)

// test 
%inline %{

void test_set_imageBitmap(std::shared_ptr<ImageBitmap> bitmap) {
}

std::shared_ptr<ImageBitmap> test_get_imageBitmap() {
  return std::make_shared<ImageBitmap>(std::unique_ptr<void, void (*)(void *)>(nullptr, free), 100, 100);
}

std::shared_ptr<std::vector<std::shared_ptr<ImageBitmap>>> test_get_imageBitmaps() {
  auto bitmaps = std::make_shared<std::vector<std::shared_ptr<ImageBitmap>>>();
  bitmaps->emplace_back(std::make_shared<ImageBitmap>(std::unique_ptr<void, void (*)(void *)>(nullptr, free), 100, 100));
  return bitmaps;
}

void test_set_imageBitmaps(std::shared_ptr<std::vector<std::shared_ptr<ImageBitmap>>> bitmaps) {
}

ImageBitmap * test_get_imageBitmap2() {
  return new ImageBitmap(std::unique_ptr<void, void (*)(void *)>(nullptr, free), 100, 100);
}
%}

%{
std::shared_ptr<ImageBitmap> swig_imageBitmap_js2c(SWIGV8_VALUE js_obj) {
  std::shared_ptr<void> ptr;
  SWIG_ConvertPtr(js_obj, ptr, SWIGTYPE_p_ImageBitmap, 0 | 0);
  return std::reinterpret_pointer_cast<ImageBitmap>(ptr);
}
%}
