import { Vec3 } from "./Vec3.js";
import { impl } from "./context.js";
const vec3_a = new Vec3(null);
const vec3_b = new Vec3(null);
const vec3_c = new Vec3(null);
export class DebugDrawer {
    set drawLine(value) {
        this.impl.drawLine = (ptr_from, ptr_to, ptr_color) => {
            vec3_a.impl = impl.wrapPointer(ptr_from, impl.btVector3);
            vec3_b.impl = impl.wrapPointer(ptr_to, impl.btVector3);
            vec3_c.impl = impl.wrapPointer(ptr_color, impl.btVector3);
            // ammo.destroy(bt_to);// FIXME
            value(vec3_a, vec3_b, vec3_c);
        };
    }
    constructor() {
        this.impl = new impl.DebugDrawer;
        this.impl.drawContactPoint = function (pointOnB, normalOnB, distance, lifeTime, color) {
            console.log("drawContactPoint");
        };
        this.impl.reportErrorWarning = function (warningString) {
            console.log("reportErrorWarning");
        };
        this.impl.draw3dText = function (location, textString) {
            console.log("draw3dText");
        };
        this.impl.setDebugMode = function (debugMode) {
            console.log("setDebugMode");
        };
        this.impl.getDebugMode = function () {
            return 16385;
        };
        // this.impl.__destroy__ = () => {
        // }
    }
}
