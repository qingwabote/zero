import Component from "../../Component.js";
import vec3 from "../../math/vec3.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";
import Primitive from "../Primitive.js";

export default class DebugDrawer extends Component {
    start(): void {
        const primitive = this.node.addComponent(Primitive);

        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;
        const bt_debugDrawer = new ammo.DebugDrawer;
        bt_debugDrawer.drawLine = (ptr_from: any, ptr_to: any, ptr_color: any) => {
            const bt_from = ammo.wrapPointer(ptr_from, ammo.btVector3);
            const from = vec3.create(bt_from.x(), bt_from.y(), bt_from.z());
            // ammo.destroy(bt_from); // FIXME

            const bt_to = ammo.wrapPointer(ptr_to, ammo.btVector3);
            const to = vec3.create(bt_to.x(), bt_to.y(), bt_to.z());
            // ammo.destroy(bt_to);// FIXME

            primitive.drawLine(from, to);
        }
        bt_debugDrawer.drawContactPoint = (pointOnB: any, normalOnB: any, distance: any, lifeTime: any, color: any) => {
            console.log("drawContactPoint")
        }
        bt_debugDrawer.reportErrorWarning = (warningString: any) => {
            console.log("reportErrorWarning")
        }
        bt_debugDrawer.draw3dText = (location: any, textString: any) => {
            console.log("draw3dText")
        }
        bt_debugDrawer.setDebugMode = (debugMode: any) => {
            console.log("setDebugMode")
        }
        bt_debugDrawer.getDebugMode = () => {
            return 16385;
        }
        // bt_debugDrawer.__destroy__ = () => {

        // }
        ps.world.impl.setDebugDrawer(bt_debugDrawer);
    }

    update(): void {
        this.node.getComponent(Primitive)?.clear();
    }
}