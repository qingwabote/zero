import { root } from "../scene/Root.js";
import { Cascades } from "./shadow/Cascades.js";

export class Shadow {
    private _cascades: Record<number, Cascades> = {};
    public get cascades(): Readonly<Record<number, Cascades>> {
        return this._cascades;
    }

    private _visibleCameras: number[] = [];
    public get visibleCameras(): readonly number[] {
        return this._visibleCameras;
    }

    private _visibilities_invalidated = false;
    private _visibilities: number = 0;
    public get visibilities(): number {
        return this._visibilities;
    }
    public set visibilities(value: number) {
        this._visibilities = value;
        this._visibilities_invalidated = true;
    }

    update(dumping: boolean) {
        if (this._visibilities_invalidated) {
            const cameras = root.cameras;
            this._visibleCameras.length = 0;
            for (let i = 0; i < cameras.length; i++) {
                if (cameras[i].visibilities & this._visibilities) {
                    this._cascades[i] || (this._cascades[i] = new Cascades(cameras[i]));
                    this._visibleCameras.push(i);
                }
            }
            this._visibilities_invalidated = false;
        }
        for (let i = 0; i < this._visibleCameras.length; i++) {
            this._cascades[this._visibleCameras[i]].update(dumping);
        }
    }
}