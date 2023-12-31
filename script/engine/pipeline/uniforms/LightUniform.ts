import { BufferUsageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { vec3 } from "../../core/math/vec3.js";
import { Context } from "../../core/render/Context.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { BufferViewWritable } from "../../core/render/scene/buffers/BufferViewWritable.js";
import { shaderLib } from "../../core/shaderLib.js";

const LightBlock = shaderLib.sets.global.uniforms.Light;

export class LightUniform extends Uniform {
    static readonly definition = LightBlock;

    private _buffer: BufferViewWritable;

    constructor(context: Context) {
        super(context);

        const buffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        context.descriptorSet.bindBuffer(LightBlock.binding, buffer.buffer)
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = Zero.instance.scene;
        const directionalLight = renderScene.directionalLight!;
        if (directionalLight.hasChanged) {
            const litDir = vec3.normalize(vec3.create(), directionalLight.position);
            this._buffer.set(litDir, 0);
            this._buffer.update();
        }
    }
}