import { root } from "../scene/Root.js";
import { SplitFrustum } from "./SplitFrustum.js";

export class Shadow {
    static readonly LEVEL_COUNT = 4;

    private _boundingFrusta: Record<number, SplitFrustum> = {};
    public get boundingFrusta(): Readonly<Record<number, SplitFrustum>> {
        return this._boundingFrusta;
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
                    this._boundingFrusta[i] || (this._boundingFrusta[i] = new SplitFrustum(cameras[i], Shadow.LEVEL_COUNT));
                    this._visibleCameras.push(i);
                }
            }
            this._visibilities_invalidated = false;
        }
        for (let i = 0; i < this._visibleCameras.length; i++) {
            this._boundingFrusta[this._visibleCameras[i]].update(dumping);
        }
    }
}