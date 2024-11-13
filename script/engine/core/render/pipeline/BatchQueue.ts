import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";

export class BatchQueue {
    private _data: Map<Pass, Batch[]>[] = [];
    private _index = 0;
    private _count = 0;

    push(): Map<Pass, Batch[]> {
        if (this._data.length > this._count == false) {
            this._data.push(new Map);
        }
        return this._data[this._count++];
    }

    front(): ReadonlyMap<Pass, Batch[]> | undefined {
        return this._index < this._count ? this._data[this._index] : undefined;
    }

    pop(): void {
        this._data[this._index].clear();
        if (this._index + 1 < this._count) {
            this._index++;
        } else {
            this._index = 0;
            this._count = 0;
        }
    }
}