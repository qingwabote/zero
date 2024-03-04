import { vec3 } from "../core/math/vec3.js";
import { Primitive } from "./Primitive.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class Frustum extends Primitive {
    constructor() {
        super(...arguments);
        this.orthoSize = -1;
        this.fov = -1;
        /**width / height */
        this.aspect = 1;
        this.near = 1;
        this.far = 1000;
    }
    update(dt) {
        if (this.isPerspective()) {
            this.drawPerspective();
        }
        else {
            this.drawOrtho();
        }
    }
    drawPerspective() {
        this.clear();
        const tanH = Math.tan(this.fov / 2);
        const tanW = tanH * this.aspect;
        const halfNearW = this.near * tanW;
        const halfNearH = this.near * tanH;
        vec3.set(vec3_a, -halfNearW, halfNearH, -this.near);
        vec3.set(vec3_b, -halfNearW, -halfNearH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfNearW, -halfNearH, -this.near);
        vec3.set(vec3_b, halfNearW, -halfNearH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfNearW, -halfNearH, -this.near);
        vec3.set(vec3_b, halfNearW, halfNearH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfNearW, halfNearH, -this.near);
        vec3.set(vec3_b, -halfNearW, halfNearH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        const halfFarW = this.far * tanW;
        const halfFarH = this.far * tanH;
        vec3.set(vec3_a, -halfFarW, halfFarH, -this.far);
        vec3.set(vec3_b, -halfFarW, -halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfFarW, -halfFarH, -this.far);
        vec3.set(vec3_b, halfFarW, -halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfFarW, -halfFarH, -this.far);
        vec3.set(vec3_b, halfFarW, halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfFarW, halfFarH, -this.far);
        vec3.set(vec3_b, -halfFarW, halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfNearW, halfNearH, -this.near);
        vec3.set(vec3_b, -halfFarW, halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfNearW, -halfNearH, -this.near);
        vec3.set(vec3_b, -halfFarW, -halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfNearW, -halfNearH, -this.near);
        vec3.set(vec3_b, halfFarW, -halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfNearW, halfNearH, -this.near);
        vec3.set(vec3_b, halfFarW, halfFarH, -this.far);
        this.drawLine(vec3_a, vec3_b);
    }
    drawOrtho() {
        this.clear();
        const halfH = this.orthoSize;
        const halfW = halfH * this.aspect;
        vec3.set(vec3_a, -halfW / 3, 0, -this.near);
        vec3.set(vec3_b, halfW / 3, 0, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, 0, -halfH / 3, -this.near);
        vec3.set(vec3_b, 0, halfH / 3, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, halfH, -this.near);
        vec3.set(vec3_b, -halfW, -halfH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, -halfH, -this.near);
        vec3.set(vec3_b, halfW, -halfH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, -halfH, -this.near);
        vec3.set(vec3_b, halfW, halfH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, halfH, -this.near);
        vec3.set(vec3_b, -halfW, halfH, -this.near);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, halfH, -this.far);
        vec3.set(vec3_b, -halfW, -halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, -halfH, -this.far);
        vec3.set(vec3_b, halfW, -halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, -halfH, -this.far);
        vec3.set(vec3_b, halfW, halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, halfH, -this.far);
        vec3.set(vec3_b, -halfW, halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, halfH, -this.near);
        vec3.set(vec3_b, -halfW, halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, -halfW, -halfH, -this.near);
        vec3.set(vec3_b, -halfW, -halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, -halfH, -this.near);
        vec3.set(vec3_b, halfW, -halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
        vec3.set(vec3_a, halfW, halfH, -this.near);
        vec3.set(vec3_b, halfW, halfH, -this.far);
        this.drawLine(vec3_a, vec3_b);
    }
    isPerspective() {
        if (this.fov != -1) {
            return true;
        }
        if (this.orthoSize != -1) {
            return false;
        }
        throw new Error("can't recognize projection type");
    }
}
