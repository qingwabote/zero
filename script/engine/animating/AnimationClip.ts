import { pk } from "puttyknife";

type ChannelPath = 'translation' | 'rotation' | 'scale' | 'weights';

interface Channel {
    readonly node: readonly string[];
    readonly path: ChannelPath;
}

export class AnimationClip {
    constructor(
        readonly channels: readonly Channel[],
        readonly name: string,
        readonly duration: number,
        /** FIXME: free it */
        readonly handle: pk.ObjectHandle) { }
}

export declare namespace AnimationClip {
    export { Channel, ChannelPath }
}