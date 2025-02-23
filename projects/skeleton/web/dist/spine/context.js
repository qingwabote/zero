let texture_id = 1;
const texture_map = new Map;
export const textureMap = {
    register(texture) {
        texture_map.set(texture_id, new WeakRef(texture));
        return texture_id++;
    },
    retrive(id) {
        var _a;
        return (_a = texture_map.get(id)) === null || _a === void 0 ? void 0 : _a.deref();
    }
};
