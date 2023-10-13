import { QuatLike } from "./quat.js";
import { Vec3Like } from "./vec3.js";

export interface Translation {
    position: Readonly<Vec3Like>;
}

export interface Rotation {
    rotation: Readonly<QuatLike>;
}

export interface Scale {
    scale: Readonly<Vec3Like>;
}

export interface TRS extends Translation, Rotation, Scale { } 