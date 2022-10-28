#include "bindings/gfx/Shader.hpp"
#include "VkShader_impl.hpp"
#include "sugars/v8sugar.hpp"

#include "glslang/Public/ShaderLang.h"
// #include "glslang/SPIRV/Logger.h"
#include "glslang/SPIRV/SpvTools.h"
#include "glslang/SPIRV/GlslangToSpv.h"

namespace
{
    // https://github.com/KhronosGroup/glslang/blob/sdk-1.3.224/StandAlone/ResourceLimits.cpp
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

namespace binding
{
    namespace gfx
    {
        Shader_impl::Shader_impl(Device_impl *device) : _device(device) {}

        Shader_impl::~Shader_impl() {}

        Shader::Shader(std::unique_ptr<Shader_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        v8::Local<v8::Object> Shader::info()
        {
            return retrieve("info");
        }

        bool Shader::initialize(v8::Local<v8::Object> info)
        {
            retain(info, "info");

            v8::Isolate *isolate = info->GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            auto gfx_stages = sugar::v8::object_get(info, "stages").As<v8::Array>();
            for (size_t i = 0; i < gfx_stages->Length(); i++)
            {
                const int version_semantics = 100; // https://github.com/KhronosGroup/GLSL/blob/master/extensions/khr/GL_KHR_vulkan_glsl.txt

                auto messages = static_cast<EShMessages>(EShMsgSpvRules | EShMsgVulkanRules);

                auto gfx_stage = gfx_stages->Get(context, i).ToLocalChecked().As<v8::Object>();
                auto gfx_state_type = sugar::v8::object_get(gfx_stage, "type").As<v8::Number>()->Value();

                EShLanguage stage = gfx_state_type == VK_SHADER_STAGE_VERTEX_BIT ? EShLangVertex : EShLangFragment;
                std::string source{*v8::String::Utf8Value{isolate, sugar::v8::object_get(gfx_stage, "source")}};
                source = "#version 450\n" + source;
                const char *source_c_str = source.c_str();

                glslang::TShader shader{stage};
                shader.setStrings(&source_c_str, 1);
                shader.setEnvInput(glslang::EShSourceGlsl, stage, glslang::EShClientVulkan, version_semantics);
                shader.setEnvClient(glslang::EShClientVulkan, static_cast<glslang::EShTargetClientVersion>(_impl->_device->version()));
                glslang::EShTargetLanguageVersion version_spirv;
                switch (_impl->_device->version())
                {
                case VK_MAKE_API_VERSION(0, 1, 1, 0):
                    version_spirv = glslang::EShTargetSpv_1_3;
                    break;

                default:
                    printf("Unsupported vulkan api version %d\n", _impl->_device->version());
                    return true;
                }
                shader.setEnvTarget(glslang::EShTargetSpv, version_spirv);

                if (!shader.parse(&DefaultTBuiltInResource, version_semantics, false, messages))
                {
                    printf("GLSL Parsing Failed:\n%s\n%s\n", shader.getInfoLog(), shader.getInfoDebugLog());
                    printf("source:\n%s\n", source_c_str);
                    return true;
                }

                glslang::TProgram program;
                program.addShader(&shader);
                if (!program.link(messages))
                {
                    printf("GLSL Linking Failed:\n%s\n%s\n", program.getInfoLog(), program.getInfoDebugLog());
                    printf("source:\n%s\n", source_c_str);
                    return true;
                }

                std::vector<uint32_t> spirv;
                // spv::SpvBuildLogger logger;
                // glslang::SpvOptions spvOptions;
                // spvOptions.disableOptimizer = false;
                // spvOptions.optimizeSize = true;
                // spvOptions.stripDebugInfo = true;
                // glslang::GlslangToSpv(*program.getIntermediate(type), spirv, &logger, &spvOptions);
                glslang::GlslangToSpv(*program.getIntermediate(stage), spirv);

                VkShaderModuleCreateInfo moduleCreateInfo = {};
                moduleCreateInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
                moduleCreateInfo.pNext = nullptr;
                moduleCreateInfo.codeSize = spirv.size() * sizeof(uint32_t);
                moduleCreateInfo.pCode = spirv.data();
                VkShaderModule shaderModule;
                if (vkCreateShaderModule(_impl->_device->device(), &moduleCreateInfo, nullptr, &shaderModule))
                {
                    return true;
                }

                VkPipelineShaderStageCreateInfo stageCreateInfo{};
                stageCreateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
                stageCreateInfo.pNext = nullptr;
                stageCreateInfo.stage = static_cast<VkShaderStageFlagBits>(gfx_state_type);
                stageCreateInfo.module = shaderModule;
                // the entry point of the shader
                stageCreateInfo.pName = "main";
                _impl->_stageInfos.push_back(stageCreateInfo);
            }

            return false;
        }

        Shader::~Shader()
        {
            for (size_t i = 0; i < _impl->_stageInfos.size(); i++)
            {
                vkDestroyShaderModule(_impl->_device->device(), _impl->_stageInfos[i].module, nullptr);
            }
        }
    }
}
