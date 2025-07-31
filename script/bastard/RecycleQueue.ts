export class RecycleQueue<T> {
    private readonly _data: T[] = [];

    private _count = 0;

    constructor(private readonly _create: () => T) { }

    push(): T {
        if (this._count == this._data.length) {
            this._data.push(this._create());
        }
        return this._data[this._count++];
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this._count; i++) {
            const item = this._data[i];
            yield item;
        }
    }

    *drain(): IterableIterator<T> {
        for (let i = 0; i < this._count; i++) {
            const item = this._data[i];
            yield item;
        }
        this._count = 0;
    }
}