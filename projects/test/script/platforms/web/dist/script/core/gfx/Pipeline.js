export const BuiltinUniformBlocks = {
    global: {
        set: 0,
        blocks: {
            Camera: {
                binding: 0,
                // uniforms: {
                //     matProj: {}
                // }
            }
        }
    },
    local: {
        set: 1,
        blocks: {
            Local: {
                binding: 0,
                // uniforms: {
                //     matWorld: {}
                // }
            }
        }
    }
};
export var DescriptorType;
(function (DescriptorType) {
    DescriptorType[DescriptorType["UNIFORM_BUFFER"] = 1] = "UNIFORM_BUFFER";
    DescriptorType[DescriptorType["SAMPLER_TEXTURE"] = 16] = "SAMPLER_TEXTURE";
})(DescriptorType || (DescriptorType = {}));
function buildDescriptorSetLayout(res) {
    const bindings = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = { binding: block.binding, descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 };
    }
    return { bindings };
}
export const BuiltinDescriptorSetLayouts = {
    global: buildDescriptorSetLayout(BuiltinUniformBlocks.global),
    local: buildDescriptorSetLayout(BuiltinUniformBlocks.local)
};
export var BlendFactor;
(function (BlendFactor) {
    BlendFactor[BlendFactor["ZERO"] = 0] = "ZERO";
    BlendFactor[BlendFactor["ONE"] = 1] = "ONE";
    // SRC_ALPHA,
    // DST_ALPHA,
    // ONE_MINUS_SRC_ALPHA,
    // ONE_MINUS_DST_ALPHA,
    // SRC_COLOR,
    // DST_COLOR,
    // ONE_MINUS_SRC_COLOR,
    // ONE_MINUS_DST_COLOR,
    // SRC_ALPHA_SATURATE,
    // CONSTANT_COLOR,
    // ONE_MINUS_CONSTANT_COLOR,
    // CONSTANT_ALPHA,
    // ONE_MINUS_CONSTANT_ALPHA,
})(BlendFactor || (BlendFactor = {}));
//# sourceMappingURL=Pipeline.js.map