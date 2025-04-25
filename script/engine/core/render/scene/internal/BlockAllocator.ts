export interface BlockHandle {
    index: number;
    view: Float32Array;
}

export class BlockAllocator {
    private _chunks: ArrayBuffer[] = [];
    private _blockIndex: number = 0;

    private _handles: BlockHandle[] = [];
    constructor(
        public readonly blockBytes: number,
        public readonly chunkSize: number
    ) {
    }

    alloc(): Readonly<BlockHandle> {
        const chunkIndex = Math.floor(this._blockIndex / this.chunkSize);
        const localIndex = this._blockIndex % this.chunkSize;
        if (!this._chunks[chunkIndex]) {
            this._chunks[chunkIndex] = new ArrayBuffer(this.blockBytes * this.chunkSize);
        }
        if (!this._handles[this._blockIndex]) {
            this._handles[this._blockIndex] = { index: this._blockIndex, view: new Float32Array(this._chunks[chunkIndex], this.blockBytes * localIndex, this.blockBytes / 4) }
        }

        return this._handles[this._blockIndex++];
    }

    free(hanlde: Readonly<BlockHandle>) {

    }

    reset() {
        this._blockIndex = 0;
    }
}