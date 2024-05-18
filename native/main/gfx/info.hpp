#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

// copy from TypeDef.h in cocos
#define GFX_ENUM_BITWISE_OPERATORS(T)                                                                                                                                             \
    constexpr bool operator!(const T v) { return !static_cast<std::underlying_type<T>::type>(v); }                                                                                \
    constexpr T operator~(const T v) { return static_cast<T>(~static_cast<std::underlying_type<T>::type>(v)); }                                                                   \
    constexpr bool operator||(const T lhs, const T rhs) { return (static_cast<std::underlying_type<T>::type>(lhs) || static_cast<std::underlying_type<T>::type>(rhs)); }          \
    constexpr bool operator&&(const T lhs, const T rhs) { return (static_cast<std::underlying_type<T>::type>(lhs) && static_cast<std::underlying_type<T>::type>(rhs)); }          \
    constexpr T operator|(const T lhs, const T rhs) { return static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) | static_cast<std::underlying_type<T>::type>(rhs)); } \
    constexpr T operator&(const T lhs, const T rhs) { return static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) & static_cast<std::underlying_type<T>::type>(rhs)); } \
    constexpr T operator^(const T lhs, const T rhs) { return static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) ^ static_cast<std::underlying_type<T>::type>(rhs)); } \
    constexpr T operator+(const T lhs, const T rhs) { return static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) + static_cast<std::underlying_type<T>::type>(rhs)); } \
    constexpr T operator+(const T lhs, bool rhs) { return static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) + rhs); }                                                \
    constexpr void operator|=(T &lhs, const T rhs) { lhs = static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) | static_cast<std::underlying_type<T>::type>(rhs)); }   \
    constexpr void operator&=(T &lhs, const T rhs) { lhs = static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) & static_cast<std::underlying_type<T>::type>(rhs)); }   \
    constexpr void operator^=(T &lhs, const T rhs) { lhs = static_cast<T>(static_cast<std::underlying_type<T>::type>(lhs) ^ static_cast<std::underlying_type<T>::type>(rhs)); }

namespace gfx
{
    class Buffer;
    class DescriptorSetLayout;
    class PipelineLayout;
    class RenderPass;
    class Shader;
    class Texture;
    class CommandBuffer;
    class Fence;
    class Semaphore;

    using FloatVector = std::vector<float>;
    using Uint32Vector = std::vector<uint32_t>;
    using StringVector = std::vector<std::string>;

    enum class Format
    {
        UNDEFINED = 0,
        R8_UINT = 13,
        RGBA8_UNORM = 37,
        RGBA8_UINT = 41,
        RGBA8_SRGB = 43,
        R16_UINT = 74,
        RGBA16_UINT = 95,
        R32_UINT = 98,
        RG32_SFLOAT = 103,
        RGB32_SFLOAT = 106,
        RGBA32_UINT = 107,
        RGBA32_SFLOAT = 109,
    };

    struct FormatInfo
    {
        std::string name;
        uint32_t bytes;
        uint32_t nums;
    };

    extern const std::unordered_map<Format, FormatInfo> FormatInfos;

    enum class BufferUsageFlagBits
    {
        NONE = 0,
        TRANSFER_DST = 0x00000002,
        UNIFORM = 0x00000010,
        INDEX = 0x00000040,
        VERTEX = 0x00000080,
    };

    enum class MemoryUsage
    {
        NONE = 0,
        GPU_ONLY = 1,
        CPU_TO_GPU = 3,
    };

    struct BufferInfo
    {
        BufferUsageFlagBits usage;
        MemoryUsage mem_usage;
        uint32_t size;
        uint32_t stride;
    };

    enum class ShaderStageFlagBits
    {
        VERTEX = 0x1,
        FRAGMENT = 0x10
    };
    // typedef uint32_t ShaderStageFlags;

    enum class DescriptorType
    {
        NONE = 0,
        SAMPLER_TEXTURE = 1,
        UNIFORM_BUFFER = 6,
        UNIFORM_BUFFER_DYNAMIC = 8,
    };

    struct DescriptorSetLayoutBinding
    {
        uint32_t binding;
        DescriptorType descriptorType;
        uint32_t descriptorCount;
        ShaderStageFlagBits stageFlags;
    };

    using DescriptorSetLayoutBindingVector = std::vector<std::shared_ptr<DescriptorSetLayoutBinding>>;

    struct DescriptorSetLayoutInfo
    {
        std::shared_ptr<DescriptorSetLayoutBindingVector> bindings{new DescriptorSetLayoutBindingVector()};
    };

    enum class SampleCountFlagBits
    {
        X1 = 0x00000001,
        X2 = 0x00000002,
        X4 = 0x00000004,
        X8 = 0x00000008,
    };

    enum class TextureUsageFlagBits
    {
        NONE = 0,
        TRANSFER_DST = 0x00000002,
        SAMPLED = 0x00000004,
        COLOR = 0x00000010,
        DEPTH_STENCIL = 0x00000020,
        TRANSIENT = 0x00000040,
    };
    GFX_ENUM_BITWISE_OPERATORS(TextureUsageFlagBits);

    struct TextureInfo
    {
        SampleCountFlagBits samples{SampleCountFlagBits::X1};
        TextureUsageFlagBits usage{TextureUsageFlagBits::NONE};
        uint32_t width{0};
        uint32_t height{0};
    };

    using TextureVector = std::vector<std::shared_ptr<Texture>>;

    struct FramebufferInfo
    {
        std::shared_ptr<TextureVector> colors{new TextureVector()};
        std::shared_ptr<Texture> depthStencil;
        std::shared_ptr<TextureVector> resolves{new TextureVector()};
        std::shared_ptr<RenderPass> renderPass;
        uint32_t width{0};
        uint32_t height{0};
    };

    enum class LOAD_OP
    {
        LOAD = 0,
        CLEAR = 1,
    };
    enum class ImageLayout
    {
        UNDEFINED = 0,
        COLOR = 2,
        DEPTH_STENCIL = 3,
        DEPTH_STENCIL_READ_ONLY = 4,
        SHADER_READ_ONLY = 5,
        PRESENT_SRC = 1000001002,
    };
    struct AttachmentDescription
    {
        LOAD_OP loadOp;
        ImageLayout initialLayout;
        ImageLayout finalLayout;
    };
    using AttachmentDescriptionVector = std::vector<std::shared_ptr<AttachmentDescription>>;
    struct RenderPassInfo
    {
        std::shared_ptr<AttachmentDescriptionVector> colors{new AttachmentDescriptionVector()};
        std::shared_ptr<AttachmentDescription> depthStencil;
        std::shared_ptr<AttachmentDescriptionVector> resolves{new AttachmentDescriptionVector()};
        SampleCountFlagBits samples{SampleCountFlagBits::X1};
    };

    enum class Filter
    {
        NEAREST = 0,
        LINEAR = 1
    };
    struct SamplerInfo
    {
        Filter magFilter;
        Filter minFilter;
    };

    struct ShaderInfo
    {
        std::shared_ptr<StringVector> sources{new StringVector()};
        std::shared_ptr<Uint32Vector> types{new Uint32Vector()};
    };

    using DescriptorSetLayoutVector = std::vector<std::shared_ptr<DescriptorSetLayout>>;
    struct PipelineLayoutInfo
    {
        std::shared_ptr<DescriptorSetLayoutVector> layouts{new DescriptorSetLayoutVector()};
    };

    struct VertexAttribute
    {
        std::string name;
        uint32_t format;
        uint32_t buffer;
        uint32_t offset;
        uint32_t location;
        bool instanced;
    };
    using VertexAttributeVector = std::vector<std::shared_ptr<VertexAttribute>>;

    using BufferVector = std::vector<std::shared_ptr<Buffer>>;
    struct VertexInput
    {
        std::shared_ptr<BufferVector> buffers{new BufferVector()};
        std::shared_ptr<Uint32Vector> offsets{new Uint32Vector()};
    };
    enum class IndexType
    {
        UINT16 = 0,
        UINT32 = 1,
    };
    struct IndexInput
    {
        std::shared_ptr<Buffer> buffer;
        IndexType type{0};
    };
    struct InputAssembler
    {
        std::shared_ptr<VertexAttributeVector> vertexAttributes{new VertexAttributeVector()};
        std::shared_ptr<VertexInput> vertexInput;
        std::shared_ptr<IndexInput> indexInput;
    };

    enum class CullMode
    {
        NONE = 0,
        FRONT = 0x00000001,
        BACK = 0x00000002,
    };
    struct RasterizationState
    {
        CullMode cullMode;
    };
    struct DepthStencilState
    {
        bool depthTestEnable;
    };
    enum class BlendFactor
    {
        ZERO = 0,
        ONE = 1,
        SRC_ALPHA = 6,
        ONE_MINUS_SRC_ALPHA = 7,
        DST_ALPHA = 8,
        ONE_MINUS_DST_ALPHA = 9,
    };
    struct BlendState
    {
        BlendFactor srcRGB;
        BlendFactor dstRGB;
        BlendFactor srcAlpha;
        BlendFactor dstAlpha;
    };
    enum class PrimitiveTopology
    {
        POINT_LIST = 0,
        LINE_LIST = 1,
        TRIANGLE_LIST = 3
    };
    struct PassState
    {
        std::shared_ptr<Shader> shader;
        PrimitiveTopology primitive{0};
        std::shared_ptr<RasterizationState> rasterizationState;
        std::shared_ptr<DepthStencilState> depthStencilState;
        std::shared_ptr<BlendState> blendState;
    };

    struct PipelineInfo
    {
        std::shared_ptr<PassState> passState;
        std::shared_ptr<InputAssembler> inputAssembler;
        std::shared_ptr<PipelineLayout> layout;
        std::shared_ptr<RenderPass> renderPass;
    };

    struct SubmitInfo
    {
        std::shared_ptr<CommandBuffer> commandBuffer;
        std::shared_ptr<Semaphore> waitSemaphore;
        int32_t waitDstStageMask;
        std::shared_ptr<Semaphore> signalSemaphore;
    };
}
