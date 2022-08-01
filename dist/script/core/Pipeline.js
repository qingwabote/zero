export const FixedUniformBlocks = {
    global: {
        set: 0,
        blocks: {
            Camera: {
                binding: 0,
                uniforms: {
                    matProj: {}
                }
            }
        }
    },
    local: {
        set: 1,
        blocks: {
            Local: {
                binding: 0,
                uniforms: {
                    matWorld: {}
                }
            }
        }
    }
};
export var DescriptorType;
(function (DescriptorType) {
    DescriptorType[DescriptorType["UNIFORM_BUFFER"] = 1] = "UNIFORM_BUFFER";
})(DescriptorType || (DescriptorType = {}));
function buildDescriptorSetLayout(res) {
    const bindings = [];
    for (const name in res.blocks) {
        const block = res.blocks[name];
        bindings[block.binding] = { binding: block.binding, descriptorType: DescriptorType.UNIFORM_BUFFER, count: 1 };
    }
    return { bindings };
}
export const globalDescriptorSetLayout = buildDescriptorSetLayout(FixedUniformBlocks.global);
export const localDescriptorSetLayout = buildDescriptorSetLayout(FixedUniformBlocks.local);
//# sourceMappingURL=Pipeline.js.map