%module puttyknife_yoga_swig

%include "../jsb/bigint_ptr.i"

%ignore YGNodeSetDirtiedFunc;
%ignore YGNodeGetDirtiedFunc;

// ignore these by defining them to null
#define YG_EXTERN_C_BEGIN
#define YG_EXTERN_C_END
#define YG_EXPORT
#define YG_DEPRECATED(message)

// ignore enum by defining them to int
typedef int YGAlign;
typedef int YGBoxSizing;
typedef int YGDimension;
typedef int YGDirection;
typedef int YGDisplay;
typedef int YGEdge;
typedef int YGErrata;
typedef int YGExperimentalFeature;
typedef int YGFlexDirection;
typedef int YGGutter;
typedef int YGJustify;
typedef int YGLogLevel;
typedef int YGMeasureMode;
typedef int YGNodeType;
typedef int YGOverflow;
typedef int YGPositionType;
typedef int YGUnit;
typedef int YGWrap;

%ignore YGSize;
%bigint_ptr(YGSize)
%ignore YGNodeClone;
%ignore YGNodeNew;
%ignore YGNodeNewWithConfig;
%ignore YGNodeFree;
%ignore YGNodeFreeRecursive;
%ignore YGNodeFinalize;
%bigint_ptr(struct YGNode)

%include <yoga/YGNode.h>
%include <yoga/YGNodeStyle.h>
%include <yoga/YGNodeLayout.h>
%include <yoga/extension.h>

%{
#include <yoga/YGNode.h>
#include <yoga/YGNodeStyle.h>
#include <yoga/YGNodeLayout.h>
#include <yoga/extension.h>
%}
