import { QuatLike } from "./quat.js";
import { Vec3Like } from "./vec3.js";

interface Translation {
    position: Readonly<Vec3Like>;
}

interface Rotation {
    rotation: Readonly<QuatLike>;
}

interface Scale {
    scale: Readonly<Vec3Like>;
}

export interface TRS extends Translation, Rotation, Scale { } 