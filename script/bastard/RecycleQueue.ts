export class RecycleQueue<T> {
    readonly data: T[] = [];

    private _count = 0;

    constructor(private readonly _creator: () => T, private readonly _recycle: (item: T) => void) { }

    push(): T {
        if (this._count == this.data.length) {
            this.data.push(this._creator());
        }
        return this.data[this._count++];
    }

    *drain(): IterableIterator<T> {
        for (let i = 0; i < this._count; i++) {
            const item = this.data[i];
            yield item;
            this._recycle(item);
        }
        this._count = 0;
    }
}