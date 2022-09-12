#include "bindings/gfx/Pipeline.hpp"
#include "VkPipelineImpl.hpp"

namespace binding
{
    namespace gfx
    {
        PipelineImpl::PipelineImpl(VkDevice device) {}
        PipelineImpl::~PipelineImpl() {}

        Pipeline::Pipeline(std::unique_ptr<PipelineImpl> impl)
            : Binding(), _impl(std::move(impl)) {}
        Pipeline::~Pipeline() {}
    }
}