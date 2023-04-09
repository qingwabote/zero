import { Quat } from "./quat.js";
import { Vec3 } from "./vec3.js";

export interface Translation {
    position: Readonly<Vec3>;
}

export interface Rotation {
    rotation: Readonly<Quat>;
}

export interface Scale {
    scale: Readonly<Vec3>;
}

export default interface TRS extends Translation, Rotation, Scale { } 