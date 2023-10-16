/* ------------------------------------------------------------
 *  Typemap specializations for Javascript
 * ------------------------------------------------------------ */

/* ------------------------------------------------------------
 *  Fragment section
 * ------------------------------------------------------------ */

/* Include fundamental fragemt definitions */
%include <typemaps/fragments.swg>

/* Look for user fragments file. */
%include <javascriptfragments.swg>

/* Javascript fragments for fundamental types */
%include <javascriptprimtypes.swg>

/* Javascript fragments for char* strings */
%include <javascriptstrings.swg>


/* ------------------------------------------------------------
 *  Unified typemap section
 * ------------------------------------------------------------ */

/* Javascript types */

#define SWIG_Object                     SWIGV8_VALUE
#define VOID_Object                     SWIGV8_UNDEFINED()

/* Overload of the output/constant/exception/dirout handling */

/* append output */
#define SWIG_AppendOutput(result, obj) SWIGV8_AppendOutput(result, obj)

/* set constant */
#define SWIG_SetConstant(name, obj)

/* raise */
#define SWIG_Raise(obj, type, desc)  SWIG_V8_Raise(obj, type)

/* Include the unified typemap library */
%include <typemaps/swigtypemaps.swg>


%include "std_unique_ptr.i"

/* std::unique_ptr< char[] > to string */

%feature("novaluewrapper") std::unique_ptr< char[] >;
%template() std::unique_ptr< char[] >;
%typemap (out, fragment="SWIG_FromCharPtr") std::unique_ptr< char[] > %{
  $result = SWIG_FromCharPtr($1.get());
%}

/* std::unique_ptr< std::vector<char> > to ArrayBuffer */
%feature("novaluewrapper") std::unique_ptr< std::vector<char> >;
%template() std::unique_ptr< std::vector<char> >;
%typemap (out) std::unique_ptr< std::vector<char> > {
    auto vector = $1.release();
    if (vector)
    {
      $result = v8::ArrayBuffer::New(
          v8::Isolate::GetCurrent(),
          v8::ArrayBuffer::NewBackingStore(
              vector->data(), vector->size(),
              [](void *data, size_t length, void *deleter_data)
              {
                auto vector = static_cast<std::vector<char> *>(deleter_data);
                delete vector;
              },
              vector));
    }
    else
    {
      $result = SWIGV8_NULL();
    }
}
%typemap(in) std::shared_ptr<const void>& (std::shared_ptr<const void> data) {
  std::shared_ptr<v8::BackingStore> store = $input.As<v8::ArrayBuffer>()->GetBackingStore();
  data.reset(store->Data(), [store](void *) {});
  $1 = &data;
}
