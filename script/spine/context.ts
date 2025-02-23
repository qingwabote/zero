import { Texture } from "gfx";

let texture_id = 1;
const texture_map: Map<number, WeakRef<Texture>> = new Map;

export const textureMap = {
    register(texture: Texture): number {
        texture_map.set(texture_id, new WeakRef(texture));
        return texture_id++;
    },
    retrive(id: number): Texture {
        return texture_map.get(id)?.deref()!
    }
}