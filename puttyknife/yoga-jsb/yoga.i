%module puttyknife_yoga_swig

%include "../jsb/bigint_ptr.i"

%ignore YGNodeSetDirtiedFunc;
%ignore YGNodeGetDirtiedFunc;

// ignore these too
#define YG_EXTERN_C_BEGIN
#define YG_EXTERN_C_END
#define YG_EXPORT
#define YG_DEPRECATED(message)

%bigint_ptr(struct YGNode)

%include <yoga/YGNode.h>

%{
    #include <yoga/YGNode.h>
%}
