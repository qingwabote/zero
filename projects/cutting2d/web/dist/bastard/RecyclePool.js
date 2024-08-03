export class RecyclePool {
    constructor(_creator) {
        this._creator = _creator;
        this._data = [];
        this._count = 0;
    }
    get() {
        if (this._data.length > this._count == false) {
            this._data.push(this._creator());
        }
        return this._data[this._count++];
    }
    recycle() {
        this._count = 0;
    }
}
