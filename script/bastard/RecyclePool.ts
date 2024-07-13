export class RecyclePool<T> {
    private readonly _data: T[] = [];

    private _count = 0;

    constructor(private readonly _creator: () => T) { }

    get(): T {
        if (this._data.length > this._count == false) {
            this._data.push(this._creator());
        }
        return this._data[this._count++];
    }

    recycle(): void {
        this._count = 0;
    }
}