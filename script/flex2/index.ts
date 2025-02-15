import { yoga } from "yoga";

const p = yoga.fn.YGNodeNew();
const f = yoga.heap.addFunction(function (args) {
    console.log('Dirtied', p == yoga.heap.ptrAtArg(args, 0))
})
yoga.fn.YGNodeSetDirtiedFunc_PK(p, f);

export const foo = 1