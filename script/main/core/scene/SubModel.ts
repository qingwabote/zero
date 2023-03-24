import DescriptorSet from "../gfx/DescriptorSet.js";
import InputAssembler from "../gfx/InputAssembler.js";
import ShaderLib from "../ShaderLib.js";
import Pass from "./Pass.js";

export default class SubModel {
    readonly descriptorSet: DescriptorSet;

    constructor(public readonly inputAssemblers: InputAssembler[], public readonly passes: Pass[], public vertexOrIndexCount: number = 0) {
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.instance.getDescriptorSetLayout(passes[0].state.shader, ShaderLib.sets.local.index))
        this.descriptorSet = descriptorSet;
    }

    update() {
        for (const pass of this.passes) {
            pass.update();
        }
    }
}