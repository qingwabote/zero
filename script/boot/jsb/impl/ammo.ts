import { load } from 'loader';

(globalThis as any).phys = {
    getWasm: function () {
        return load('../../assets/physics/ammo.wasm.wasm', 'buffer');
    }
};