import { Component, StrokeRenderer, vec3, vec4 } from 'engine';
import * as phys from 'phys';
import { PhysicsSystem } from "./PhysicsSystem.js";
export class DebugDrawer extends Component {
    start() {
        const primitive = this.node.addComponent(StrokeRenderer);
        const debugDrawer = new phys.DebugDrawer;
        debugDrawer.drawLine = (from, to, color) => {
            primitive.line(vec3.create(from.x, from.y, from.z), vec3.create(to.x, to.y, to.z), vec4.create(color.x, color.y, color.z, 1));
        };
        PhysicsSystem.instance.world.debugDrawer = debugDrawer;
    }
    update() {
        var _a;
        (_a = this.node.getComponent(StrokeRenderer)) === null || _a === void 0 ? void 0 : _a.clear();
    }
}
