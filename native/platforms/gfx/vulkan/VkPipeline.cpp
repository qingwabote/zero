#include "bindings/gfx/Pipeline.hpp"
#include "VkPipelineImpl.hpp"

namespace binding
{
    namespace gfx
    {
        PipelineImpl::PipelineImpl() {}
        PipelineImpl::~PipelineImpl() {}

        Pipeline::Pipeline(v8::Isolate *isolate, std::unique_ptr<PipelineImpl> impl)
            : Binding(isolate), _impl(std::move(impl)) {}
        Pipeline::~Pipeline()
        {
        }
    }
}