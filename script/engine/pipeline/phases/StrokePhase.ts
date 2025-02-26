import { RecycleQueue } from "bastard";
import { device } from "boot";
import { BufferInfo, BufferUsageFlagBits, Format, VertexAttribute } from "gfx";
import { mat4 } from "../../core/math/mat4.js";
import { Context } from "../../core/render/Context.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { shaderLib } from "../../core/shaderLib.js";
import { gfxUtil } from "../../gfxUtil.js";
import { Stroke } from "../../Stroke.js";

export class StrokePhase extends Phase {
    readonly stroke: Stroke;

    private readonly _batches: Batch[];

    constructor(visibility: number) {
        super(visibility);

        const stroke = new Stroke();
        const subMesh = stroke.mesh.subMeshes[0];

        const ia = gfxUtil.cloneInputAssembler(subMesh.inputAssembler);

        const a_model = new VertexAttribute;
        a_model.location = shaderLib.attributes.model.location;
        a_model.format = Format.RGBA32_SFLOAT;
        a_model.multiple = 4;
        a_model.buffer = ia.vertexInput.buffers.size();
        a_model.instanced = true;
        ia.vertexInputState.attributes.add(a_model);

        const model = new Float32Array(mat4.IDENTITY);

        const bufferInfo = new BufferInfo;
        bufferInfo.usage = BufferUsageFlagBits.VERTEX;
        bufferInfo.size = model.byteLength;
        const buffer = device.createBuffer(bufferInfo);
        buffer.upload(model, 0, 0, 0);

        ia.vertexInput.buffers.add(buffer);
        ia.vertexInput.offsets.add(0);

        this._batches = [{ inputAssembler: ia, draw: subMesh.draw, count: 1 }]

        this.stroke = stroke;
    }

    batch(out: RecycleQueue<Map<Pass, Batch[]>>, context: Context): void {
        this.stroke.upload(context.commandBuffer);
        out.push().set(this.stroke.pass, this._batches);
    }
}