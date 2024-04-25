import { root } from "../scene/Root.js";
import { Cascades } from "./shadow/Cascades.js";

export class Shadow {
    private readonly _cascades: Map<number, Cascades> = new Map;
    public get cascades(): ReadonlyMap<number, Cascades> {
        return this._cascades;
    }

    private readonly _visibleCameras: number[] = [];
    public get visibleCameras(): readonly number[] {
        return this._visibleCameras;
    }

    private _initialized = false;

    constructor(private _visibilities: number, readonly cascadeNum: number) { }

    update(dumping: boolean) {
        if (!this._initialized) {
            const cameras = root.cameras;
            for (let i = 0; i < cameras.length; i++) {
                if (cameras[i].visibilities & this._visibilities) {
                    this._cascades.set(i, new Cascades(cameras[i], this.cascadeNum));
                    this._visibleCameras.push(i);
                }
            }
            this._initialized = true;
        }
        for (let i = 0; i < this._visibleCameras.length; i++) {
            this._cascades.get(this._visibleCameras[i])!.update(dumping);
        }
    }
}