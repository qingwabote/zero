export const block_index = Symbol('index');

export interface BlockHandle {
    [block_index]: number
}

export class BlockAllocator<Members extends Record<string, number>> {
    private readonly _chunks: Float32Array[] = [];
    private readonly _block_elements: number
    private readonly _block_handles: any[] = [];
    private _block_index: number = 0;

    constructor(
        private readonly _members: Members,
        private readonly _chunk_blocks: number = 32
    ) {
        this._block_elements = Object.keys(_members).reduce((acc, key) => acc + _members[key], 0);
    }

    alloc(): Readonly<{ [Key in keyof Members]: Float32Array } & BlockHandle> {
        const chunkIndex = Math.floor(this._block_index / this._chunk_blocks);
        if (!this._chunks[chunkIndex]) {
            this._chunks[chunkIndex] = new Float32Array(this._block_elements * this._chunk_blocks)
        }
        if (!this._block_handles[this._block_index]) {
            const block: any = {};
            let offset = this._block_elements * (this._block_index % this._chunk_blocks);
            for (const key in this._members) {
                block[key] = this._chunks[chunkIndex].subarray(offset, offset += this._members[key]);
            }
            block[block_index] = this._block_index;
            this._block_handles[this._block_index] = block
        }

        return this._block_handles[this._block_index++];
    }

    free(hanlde: Readonly<BlockHandle>) {

    }

    reset() {
        this._block_index = 0;
    }
}