import { Shape } from "./Shape.js";
import { Vec3 } from "./Vec3.js";
import { impl, load } from "./context.js";

let phys_vec3_a: Vec3;
load().then(function () {
    phys_vec3_a = new Vec3;
})

export class BoxShape extends Shape {
    constructor() {
        phys_vec3_a.set(0.5, 0.5, 0.5); // using unit-scale shape https://pybullet.org/Bullet/phpBB3/viewtopic.php?p=20760#p20760
        super(new impl.btBoxShape(phys_vec3_a.impl))
    }
}