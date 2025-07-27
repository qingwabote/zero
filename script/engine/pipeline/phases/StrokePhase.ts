import { Queue, RecycleQueue } from "bastard";
import { bundle } from "bundling";
import { BlendFactor, BlendState, DepthStencilState } from "gfx";
import { Shader } from "../../assets/Shader.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { shaderLib } from "../../core/shaderLib.js";
import { scene } from "../../index.js";
import { Stroke } from "../../Stroke.js";

const primitive = await bundle.cache('./shaders/primitive-world', Shader);

const pass = (function () {
    const depthStencilState = new DepthStencilState;
    depthStencilState.depthTestEnable = true;
    const blendState = new BlendState;
    blendState.srcRGB = BlendFactor.SRC_ALPHA;
    blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = BlendFactor.ONE;
    blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;

    return new scene.Pass({ shader: shaderLib.getShader(primitive), depthStencilState, blendState })
})()

export class StrokePhase extends Phase {
    readonly stroke: Stroke;

    private readonly _batch: Batch;

    private readonly _batches: Batch[] = [];

    constructor(visibility: number) {
        super(visibility);

        const stroke = new Stroke();
        const subMesh = stroke.mesh.subMeshes[0];

        this._batch = { draw: { inputAssembler: subMesh.inputAssembler, range: subMesh.range }, *flush() { yield 1 } }

        this.stroke = stroke;
    }

    override batch(out: RecycleQueue<Map<Pass, Queue<Batch>>>): void {
        this._batches.push(this._batch);
        out.push().set(pass, Queue(this._batches));
    }
}