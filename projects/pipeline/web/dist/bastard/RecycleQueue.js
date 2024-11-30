function createData(creator) {
    const data = new Array(8);
    for (let i = 0; i < data.length; i++) {
        data[i] = creator();
    }
    return data;
}
export class RecycleQueue {
    constructor(_creator, _recycle) {
        this._creator = _creator;
        this._recycle = _recycle;
        const block = { head: 0, tail: 0, data: createData(_creator), next: null };
        block.next = block;
        this._head = this._tail = block;
    }
    push() {
        let block = this._tail;
        if (((block.tail + 1) % block.data.length) == block.head) {
            block = block.next;
            if (block == this._head) {
                block = this._tail.next = { head: 0, tail: 0, data: createData(this._creator), next: block };
            }
        }
        const item = block.data[block.tail];
        block.tail = (block.tail + 1) % block.data.length;
        this._tail = block;
        return item;
    }
    pop() {
        let block = this._head;
        if (block.head == block.tail) {
            if (block == this._tail) {
                return false;
            }
            else {
                block = block.next;
            }
        }
        this._recycle(block.data[block.head]);
        block.head = (block.head + 1) % block.data.length;
        this._head = block;
        return true;
    }
    front() {
        let block = this._head;
        if (block.head == block.tail) {
            if (block == this._tail) {
                return null;
            }
            else {
                block = block.next;
            }
        }
        return block.data[block.head];
    }
}
