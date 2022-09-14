#include "bindings/gfx/Pipeline.hpp"
#include "VkPipeline_impl.hpp"

namespace binding
{
    namespace gfx
    {
        Pipeline_impl::Pipeline_impl(VkDevice device) {}
        Pipeline_impl::~Pipeline_impl() {}

        Pipeline::Pipeline(std::unique_ptr<Pipeline_impl> impl)
            : Binding(), _impl(std::move(impl)) {}
        Pipeline::~Pipeline() {}
    }
}