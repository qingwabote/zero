import { Vec3 } from "./Vec3.js";
import { impl } from "./context.js";

const vec3_a = new Vec3(null);
const vec3_b = new Vec3(null);
const vec3_c = new Vec3(null);

export class DebugDrawer {
    readonly impl = new impl.DebugDrawer;

    set drawLine(value: (from: Vec3, to: Vec3, color: Vec3) => void) {
        this.impl.drawLine = (ptr_from: any, ptr_to: any, ptr_color: any) => {
            vec3_a.impl = impl.wrapPointer(ptr_from, impl.btVector3);
            vec3_b.impl = impl.wrapPointer(ptr_to, impl.btVector3);
            vec3_c.impl = impl.wrapPointer(ptr_color, impl.btVector3);

            // ammo.destroy(bt_to);// FIXME

            value(vec3_a, vec3_b, vec3_c);
        }
    }

    constructor() {
        this.impl.drawContactPoint = function (pointOnB: any, normalOnB: any, distance: any, lifeTime: any, color: any) {
            console.log("drawContactPoint")
        }
        this.impl.reportErrorWarning = function (warningString: any) {
            console.log("reportErrorWarning")
        }
        this.impl.draw3dText = function (location: any, textString: any) {
            console.log("draw3dText")
        }
        this.impl.setDebugMode = function (debugMode: any) {
            console.log("setDebugMode")
        }
        this.impl.getDebugMode = function () {
            return 16385;
        }
        // this.impl.__destroy__ = () => {

        // }
    }
}