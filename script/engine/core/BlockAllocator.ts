import { pk } from "puttyknife";

export const BLOCK_INDEX = Symbol('index');

export interface BlockHandle {
    [BLOCK_INDEX]: number
}

export class BlockAllocator<Members extends Record<string, number>> {
    private readonly _chunks: pk.BufferHandle[] = [];
    private readonly _block_elements: number
    private readonly _block_handles: any[] = [];
    private readonly _block_views: any[] = [];
    private _block_index: number = 0;

    constructor(
        private readonly _members: Members,
        private readonly _chunk_blocks: number = 32
    ) {
        this._block_elements = Object.keys(_members).reduce((acc, key) => acc + _members[key], 0);
    }

    alloc(): Readonly<{ [Key in keyof Members]: pk.BufferHandle } & BlockHandle> {
        const chunkIndex = Math.floor(this._block_index / this._chunk_blocks);
        if (!this._chunks[chunkIndex]) {
            this._chunks[chunkIndex] = pk.heap.newBuffer(this._block_elements * this._chunk_blocks * 4, 0);
        }
        if (!this._block_handles[this._block_index]) {
            const block: any = {};
            let offset = this._block_elements * (this._block_index % this._chunk_blocks);
            for (const key in this._members) {
                block[key] = pk.heap.locBuffer(this._chunks[chunkIndex], offset * 4);
                offset += this._members[key]
            }
            block[BLOCK_INDEX] = this._block_index;

            this._block_handles[this._block_index] = block;
        }

        return this._block_handles[this._block_index++];
    }

    map(hanlde: Readonly<{ [Key in keyof Members]: pk.BufferHandle } & BlockHandle>): Readonly<{ [Key in keyof Members]: Float32Array }> {
        const block_index = hanlde[BLOCK_INDEX];
        if (!this._block_views[block_index]) {
            const block: any = {};
            for (const key in this._members) {
                block[key] = pk.heap.getBuffer(hanlde[key], 'f32', this._members[key]);
            }
            this._block_views[block_index] = block;
        }
        return this._block_views[block_index];
    }

    free(hanlde: Readonly<BlockHandle>) {

    }

    reset() {
        this._block_index = 0;
    }
}