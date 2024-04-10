import { Component, GeometryRenderer, vec3, vec4 } from 'engine';
import * as phys from 'phys';
import { PhysicsSystem } from "./PhysicsSystem.js";

export class DebugDrawer extends Component {
    start(): void {
        const primitive = this.node.addComponent(GeometryRenderer);

        const debugDrawer = new phys.DebugDrawer;
        debugDrawer.drawLine = (from: phys.Vec3, to: phys.Vec3, color: phys.Vec3) => {
            primitive.drawLine(vec3.create(from.x, from.y, from.z), vec3.create(to.x, to.y, to.z), vec4.create(color.x, color.y, color.z, 1));
        }
        PhysicsSystem.instance.world.debugDrawer = debugDrawer;
    }

    update(): void {
        this.node.getComponent(GeometryRenderer)?.clear();
    }
}