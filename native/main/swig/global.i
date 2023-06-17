%module global

%{
#include "Window.hpp"
%}

%{
static loader::Loader * Window_instance_loader() {
  return &Window::instance().loader();
}
%}

%constant loader::Loader *loader2 = Window_instance_loader();
