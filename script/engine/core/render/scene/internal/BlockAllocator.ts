import { pk } from "puttyknife";

export const block_index = Symbol('index');

export interface BlockHandle {
    [block_index]: number
}

export class BlockAllocator<Members extends Record<string, number>> {
    private readonly _chunks: pk.BufferHandle[] = [];
    private readonly _block_elements: number
    private readonly _block_handles: any[] = [];
    private _block_index: number = 0;

    constructor(
        private readonly _members: Members,
        private readonly _chunk_blocks: number = 32
    ) {
        this._block_elements = Object.keys(_members).reduce((acc, key) => acc + _members[key], 0);
    }

    alloc(): Readonly<{ [Key in keyof Members]: { view: Float32Array, handle: pk.BufferHandle } } & BlockHandle> {
        const chunkIndex = Math.floor(this._block_index / this._chunk_blocks);
        if (!this._chunks[chunkIndex]) {
            this._chunks[chunkIndex] = pk.heap.newBuffer(this._block_elements * this._chunk_blocks * 4, 0);
        }
        if (!this._block_handles[this._block_index]) {
            const block: any = {};
            let offset = this._block_elements * (this._block_index % this._chunk_blocks);
            for (const key in this._members) {
                const handle = pk.heap.locBuffer(this._chunks[chunkIndex], offset * 4);
                const view = pk.heap.getBuffer(handle, 'f32', this._members[key]);
                block[key] = { handle, view };
                offset += this._members[key]
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