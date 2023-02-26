import Component from "../../Component.js";
import rect, { Rect } from "../../math/rect.js";
import vec2 from "../../math/vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();

export default class VisualRectangle extends Component {
    size = vec2.create();
    anchor = vec2.create();
    touchable = true;

    getAABB(): Rect {
        const [x, y, width, height] = [-this.size[0] * this.anchor[0], -this.size[1] * this.anchor[1], this.size[0], this.size[1]];

        const lb = vec2.set(vec2_a, x, y);
        const rb = vec2.set(vec2_b, x + width, y)
        const rt = vec2.set(vec2_c, x + width, y + height)
        const lt = vec2.set(vec2_d, x, y + height)

        vec2.transformMat4(lb, lb, this.node.matrix);
        vec2.transformMat4(rb, rb, this.node.matrix);
        vec2.transformMat4(rt, rt, this.node.matrix);
        vec2.transformMat4(lt, lt, this.node.matrix);

        const l = Math.min(lb[0], rb[0], rt[0], lt[0]);
        const r = Math.max(lb[0], rb[0], rt[0], lt[0]);
        const t = Math.min(lb[1], rb[1], rt[1], lt[1]);
        const b = Math.max(lb[1], rb[1], rt[1], lt[1]);

        const aabb = rect.create(l, b, r - l, t - b);

        for (const child of this.node.children) {
            const vr = child.getComponent(VisualRectangle);
            if (!vr) {
                continue;
            }
            rect.union(aabb, aabb, vr.getAABB());
        }

        return aabb;
    }
}