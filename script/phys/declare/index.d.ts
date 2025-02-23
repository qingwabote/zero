import { Runtime } from 'puttyknife';

export declare const phys: {
    readonly fn: any,
    readonly heap: Runtime
}

type Node = number | bigint;

export declare namespace phys {
    export { Node }
}