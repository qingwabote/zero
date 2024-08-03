#include "gfx/Shader.hpp"
#include "ShaderImpl.hpp"
#include "log.h"

#include "glslang/Public/ShaderLang.h"
#include "glslang/SPIRV/SpvTools.h"
#include "glslang/SPIRV/GlslangToSpv.h"

namespace
{
    // https://github.com/KhronosGroup/glslang/blob/sdk-1.3.231.1/StandAlone/ResourceLimits.cpp
    const TBuiltInResource DefaultTBuiltInResource = {
        /* .MaxLights = */ 32,
        /* .MaxClipPlanes = */ 6,
        /* .MaxTextureUnits = */ 32,
        /* .MaxTextureCoords = */ 32,
        /* .MaxVertexAttribs = */ 64,
        /* .MaxVertexUniformComponents = */ 4096,
        /* .MaxVaryingFloats = */ 64,
        /* .MaxVertexTextureImageUnits = */ 32,
        /* .MaxCombinedTextureImageUnits = */ 80,
        /* .MaxTextureImageUnits = */ 32,
        /* .MaxFragmentUniformComponents = */ 4096,
        /* .MaxDrawBuffers = */ 32,
        /* .MaxVertexUniformVectors = */ 128,
        /* .MaxVaryingVectors = */ 8,
        /* .MaxFragmentUniformVectors = */ 16,
        /* .MaxVertexOutputVectors = */ 16,
        /* .MaxFragmentInputVectors = */ 15,
        /* .MinProgramTexelOffset = */ -8,
        /* .MaxProgramTexelOffset = */ 7,
        /* .MaxClipDistances = */ 8,
        /* .MaxComputeWorkGroupCountX = */ 65535,
        /* .MaxComputeWorkGroupCountY = */ 65535,
        /* .MaxComputeWorkGroupCountZ = */ 65535,
        /* .MaxComputeWorkGroupSizeX = */ 1024,
        /* .MaxComputeWorkGroupSizeY = */ 1024,
        /* .MaxComputeWorkGroupSizeZ = */ 64,
        /* .MaxComputeUniformComponents = */ 1024,
        /* .MaxComputeTextureImageUnits = */ 16,
        /* .MaxComputeImageUniforms = */ 8,
        /* .MaxComputeAtomicCounters = */ 8,
        /* .MaxComputeAtomicCounterBuffers = */ 1,
        /* .MaxVaryingComponents = */ 60,
        /* .MaxVertexOutputComponents = */ 64,
        /* .MaxGeometryInputComponents = */ 64,
        /* .MaxGeometryOutputComponents = */ 128,
        /* .MaxFragmentInputComponents = */ 128,
        /* .MaxImageUnits = */ 8,
        /* .MaxCombinedImageUnitsAndFragmentOutputs = */ 8,
        /* .MaxCombinedShaderOutputResources = */ 8,
        /* .MaxImageSamples = */ 0,
        /* .MaxVertexImageUniforms = */ 0,
        /* .MaxTessControlImageUniforms = */ 0,
        /* .MaxTessEvaluationImageUniforms = */ 0,
        /* .MaxGeometryImageUniforms = */ 0,
        /* .MaxFragmentImageUniforms = */ 8,
        /* .MaxCombinedImageUniforms = */ 8,
        /* .MaxGeometryTextureImageUnits = */ 16,
        /* .MaxGeometryOutputVertices = */ 256,
        /* .MaxGeometryTotalOutputComponents = */ 1024,
        /* .MaxGeometryUniformComponents = */ 1024,
        /* .MaxGeometryVaryingComponents = */ 64,
        /* .MaxTessControlInputComponents = */ 128,
        /* .MaxTessControlOutputComponents = */ 128,
        /* .MaxTessControlTextureImageUnits = */ 16,
        /* .MaxTessControlUniformComponents = */ 1024,
        /* .MaxTessControlTotalOutputComponents = */ 4096,
        /* .MaxTessEvaluationInputComponents = */ 128,
        /* .MaxTessEvaluationOutputComponents = */ 128,
        /* .MaxTessEvaluationTextureImageUnits = */ 16,
        /* .MaxTessEvaluationUniformComponents = */ 1024,
        /* .MaxTessPatchComponents = */ 120,
        /* .MaxPatchVertices = */ 32,
        /* .MaxTessGenLevel = */ 64,
        /* .MaxViewports = */ 16,
        /* .MaxVertexAtomicCounters = */ 0,
        /* .MaxTessControlAtomicCounters = */ 0,
        /* .MaxTessEvaluationAtomicCounters = */ 0,
        /* .MaxGeometryAtomicCounters = */ 0,
        /* .MaxFragmentAtomicCounters = */ 8,
        /* .MaxCombinedAtomicCounters = */ 8,
        /* .MaxAtomicCounterBindings = */ 1,
        /* .MaxVertexAtomicCounterBuffers = */ 0,
        /* .MaxTessControlAtomicCounterBuffers = */ 0,
        /* .MaxTessEvaluationAtomicCounterBuffers = */ 0,
        /* .MaxGeometryAtomicCounterBuffers = */ 0,
        /* .MaxFragmentAtomicCounterBuffers = */ 1,
        /* .MaxCombinedAtomicCounterBuffers = */ 1,
        /* .MaxAtomicCounterBufferSize = */ 16384,
        /* .MaxTransformFeedbackBuffers = */ 4,
        /* .MaxTransformFeedbackInterleavedComponents = */ 64,
        /* .MaxCullDistances = */ 8,
        /* .MaxCombinedClipAndCullDistances = */ 8,
        /* .MaxSamples = */ 4,
        /* .maxMeshOutputVerticesNV = */ 256,
        /* .maxMeshOutputPrimitivesNV = */ 512,
        /* .maxMeshWorkGroupSizeX_NV = */ 32,
        /* .maxMeshWorkGroupSizeY_NV = */ 1,
        /* .maxMeshWorkGroupSizeZ_NV = */ 1,
        /* .maxTaskWorkGroupSizeX_NV = */ 32,
        /* .maxTaskWorkGroupSizeY_NV = */ 1,
        /* .maxTaskWorkGroupSizeZ_NV = */ 1,
        /* .maxMeshViewCountNV = */ 4,
        /* .maxMeshOutputVerticesEXT = */ 256,
        /* .maxMeshOutputPrimitivesEXT = */ 256,
        /* .maxMeshWorkGroupSizeX_EXT = */ 128,
        /* .maxMeshWorkGroupSizeY_EXT = */ 128,
        /* .maxMeshWorkGroupSizeZ_EXT = */ 128,
        /* .maxTaskWorkGroupSizeX_EXT = */ 128,
        /* .maxTaskWorkGroupSizeY_EXT = */ 128,
        /* .maxTaskWorkGroupSizeZ_EXT = */ 128,
        /* .maxMeshViewCountEXT = */ 4,
        /* .maxDualSourceDrawBuffersEXT = */ 1,

        /* .limits = */ {
            /* .nonInductiveForLoops = */ 1,
            /* .whileLoops = */ 1,
            /* .doWhileLoops = */ 1,
            /* .generalUniformIndexing = */ 1,
            /* .generalAttributeMatrixVectorIndexing = */ 1,
            /* .generalVaryingIndexing = */ 1,
            /* .generalSamplerIndexing = */ 1,
            /* .generalVariableIndexing = */ 1,
            /* .generalConstantMatrixVectorIndexing = */ 1,
        }};
}

namespace gfx
{
    ShaderImpl::ShaderImpl(DeviceImpl *device) : _device(device), attributeLocations(_attributeLocations), stages(_stages) {}

    bool ShaderImpl::initialize(const ShaderInfo &info)
    {
        static const int version_semantics = 100; // https://github.com/KhronosGroup/GLSL/blob/master/extensions/khr/GL_KHR_vulkan_glsl.txt
        static EShMessages messages = static_cast<EShMessages>(EShMsgSpvRules | EShMsgVulkanRules);

        for (size_t i = 0; i < info.sources->size(); i++)
        {
            VkShaderStageFlagBits flag = static_cast<ShaderStageFlagBits>(info.types->at(i)) == ShaderStageFlagBits::VERTEX ? VK_SHADER_STAGE_VERTEX_BIT : VK_SHADER_STAGE_FRAGMENT_BIT;
            EShLanguage lang = flag == VK_SHADER_STAGE_VERTEX_BIT ? EShLangVertex : EShLangFragment;
            std::string src = "#version 450\n" + info.sources->at(i);

            glslang::TShader shader{lang};
            const char *src_c_str = src.c_str();
            shader.setStrings(&src_c_str, 1);
            shader.setEnvInput(glslang::EShSourceGlsl, lang, glslang::EShClientVulkan, version_semantics);
            shader.setEnvClient(glslang::EShClientVulkan, static_cast<glslang::EShTargetClientVersion>(_device->version()));
            glslang::EShTargetLanguageVersion version_spirv;
            switch (_device->version())
            {
            case VK_API_VERSION_1_3:
                version_spirv = glslang::EShTargetSpv_1_3;
                break;
            default:
                ZERO_LOG_ERROR("GLSL Unsupported vulkan api version");
                return true;
            }
            shader.setEnvTarget(glslang::EShTargetSpv, version_spirv);

            if (!shader.parse(&DefaultTBuiltInResource, version_semantics, false, messages))
            {
                ZERO_LOG_ERROR("GLSL Parsing Failed:\n%s\n%s\nsource:\n%s", shader.getInfoLog(), shader.getInfoDebugLog(), src.c_str());
                return true;
            }

            glslang::TProgram program;
            program.addShader(&shader);
            if (!program.link(messages))
            {
                ZERO_LOG_ERROR("GLSL Linking Failed:\n%s\n%s\nsource:\n%s", program.getInfoLog(), program.getInfoDebugLog(), src.c_str());
                return true;
            }

            std::vector<uint32_t> spirv;
            glslang::GlslangToSpv(*program.getIntermediate(lang), spirv);

            if (flag == VK_SHADER_STAGE_VERTEX_BIT)
            {
                program.buildReflection();
                for (size_t i = 0; i < program.getNumPipeInputs(); i++)
                {
                    auto &input = program.getPipeInput(i);
                    _attributeLocations.emplace(input.getType()->getQualifier().layoutLocation, input.name);
                }
            }

            VkShaderModuleCreateInfo moduleCreateInfo = {};
            moduleCreateInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
            moduleCreateInfo.pNext = nullptr;
            moduleCreateInfo.codeSize = spirv.size() * sizeof(uint32_t);
            moduleCreateInfo.pCode = spirv.data();
            VkShaderModule shaderModule;
            if (vkCreateShaderModule(*_device, &moduleCreateInfo, nullptr, &shaderModule))
            {
                return true;
            }

            VkPipelineShaderStageCreateInfo stageCreateInfo{};
            stageCreateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
            stageCreateInfo.pNext = nullptr;
            stageCreateInfo.stage = flag;
            stageCreateInfo.module = shaderModule;
            // the entry point of the shader
            stageCreateInfo.pName = "main";
            _stages.emplace_back(std::move(stageCreateInfo));
        }

        return false;
    }

    ShaderImpl::~ShaderImpl()
    {
        for (size_t i = 0; i < _stages.size(); i++)
        {
            vkDestroyShaderModule(*_device, _stages[i].module, nullptr);
        }
    }

    Shader::Shader(DeviceImpl *device, const std::shared_ptr<ShaderInfo> &info) : impl(std::make_unique<ShaderImpl>(device)), info(info) {}

    bool Shader::initialize()
    {
        if (impl->initialize(*info))
        {
            return true;
        }
        return false;
    }

    Shader::~Shader() {}
}
