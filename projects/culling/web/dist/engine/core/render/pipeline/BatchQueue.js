export class BatchQueue {
    constructor() {
        this._data = [];
        this._index = 0;
        this._count = 0;
    }
    push() {
        if (this._data.length > this._count == false) {
            this._data.push(new Map);
        }
        return this._data[this._count++];
    }
    front() {
        return this._index < this._count ? this._data[this._index] : undefined;
    }
    pop() {
        this._data[this._index].clear();
        if (this._index + 1 < this._count) {
            this._index++;
        }
        else {
            this._index = 0;
            this._count = 0;
        }
    }
}
