import { CommandBuffer } from "gfx";
import { AABB3D } from "../core/math/aabb3d.js";
import { frustum } from "../core/math/frustum.js";
import { Vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { Node } from "../core/Node.js";
import { Model } from "../core/render/scene/Model.js";
import { Stroke } from "../Stroke.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

export class GeometryRenderer extends BoundedRenderer {
    private readonly _stroke: Stroke;

    public get bounds(): Readonly<AABB3D> {
        return this._stroke.mesh.bounds;
    }

    constructor(node: Node) {
        super(node);

        this._stroke = new Stroke();
    }

    protected createModel(): Model | null {
        return new Model(this.node, this._stroke.mesh, [{ passes: [this._stroke.pass] }]);
    }

    drawLine(from: Readonly<Vec3>, to: Readonly<Vec3>, color = vec4.ONE) {
        this._stroke.drawLine(from, to, color);
    }

    drawAABB(aabb: Readonly<AABB3D>, color = vec4.ONE) {
        this._stroke.drawAABB(aabb, color);
    }

    drawFrustum(frustum: Readonly<frustum.Vertices>, color = vec4.ONE) {
        this._stroke.drawFrustum(frustum, color);
    }

    override upload(commandBuffer: CommandBuffer): void {
        this._stroke.upload(commandBuffer);
    }

    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._stroke.clear();
    }
}