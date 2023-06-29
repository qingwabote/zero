%module gfx

%include "std_shared_ptr.i"
%include "std_vector.i"
%include "std_string.i"

%{
    #include "bindings/gfx/info.hpp"
%}

%ignore binding::gfx::ShaderStageFlagBits;

%shared_ptr(std::vector<float>)
%shared_ptr(std::vector<std::string>)

%include "bindings/gfx/info.hpp"

%{
std::shared_ptr<binding::gfx::ShaderInfo> swig_ShaderInfo_js2c(SWIGV8_VALUE js_obj) {
  std::shared_ptr<binding::gfx::ShaderInfo> ptr;
  SWIG_ConvertPtr(js_obj, ptr, SWIGTYPE_p_binding__gfx__ShaderInfo, 0 | 0);
  return ptr;
}
%}

%template(StringVector) std::vector<float>;
%template(FloatVector) std::vector<std::string>;
