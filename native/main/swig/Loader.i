%module Loader

%include "std_string.i"

%{
#include "Loader.hpp"
%}

%ignore Loader::Loader;
%ignore Loader::instance;

%include "Loader.hpp"

%constant Loader *loader2 = &Loader::instance();