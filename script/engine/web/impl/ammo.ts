import WebLoader from "../WebLoader.js";

(globalThis as any).phys = {
    getWasm: function () {
        return WebLoader.instance.load('../../assets/physics/ammo.wasm.wasm', 'arraybuffer');
    }
};