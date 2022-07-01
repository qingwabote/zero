export enum ShaderStageBit {
    VERTEX = 0x1,
    FRAGMENT = 0x10,
}

export interface ShaderStage {
    readonly type: ShaderStageBit,
    readonly source: string,
}

export interface ShaderInfo {
    readonly name: string;
    readonly stages: ShaderStage[]
}

export abstract class Shader {
    protected _info: ShaderInfo;

    constructor(info: ShaderInfo) {
        this._info = info
    }
}

export enum BufferUsageBit {
    INDEX = 0x4,
    VERTEX = 0x8,
    UNIFORM = 0x10,
}

export interface BufferInfo {
    readonly usage: BufferUsageBit
    readonly stride: number;
    readonly size: number;
    // readonly offset: number
}

export abstract class Buffer {
    protected _info: BufferInfo;
    get info(): BufferInfo {
        return this._info;
    }
    constructor(info: BufferInfo) {
        this._info = info
    }
    abstract update(buffer: Readonly<BufferSource>): void;
}

export interface Device {
    createShader(info: ShaderInfo): Shader;
    createBuffer(info: BufferInfo): Buffer;
}

export enum Format {
    R8UI,
    RG32F,
    RGB32F
}

interface FormatInfo {
    readonly name: string;
    readonly size: number
    readonly count: number;
}

export const FormatInfos: Readonly<FormatInfo[]> = [
    { name: "R8UI", size: 2, count: 1 },
    { name: "RG32F", size: 8, count: 2 },
    { name: "RGB32F", size: 12, count: 3 },
]

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly binding: number;
    readonly format: Format;
}

export interface InputAssembler {
    readonly attributes: VertexInputAttributeDescription[];
    readonly vertexBuffers: Buffer[];
    readonly indexBuffer: Buffer;
}

export interface Pipeline {
    readonly shader: Shader;
}

export interface CommandBuffer {
    beginRenderPass(): void;
    bindPipeline(pipeline: Pipeline): void;
    bindInputAssembler(inputAssembler: InputAssembler): void;
    draw(): void;
    endRenderPass(): void
}

// export interface DrawPass {

// }

let _device: Device

let _commandBuffer: CommandBuffer;

export default {
    get device(): Device {
        return _device;
    },

    get commandBuffer(): CommandBuffer {
        return _commandBuffer;
    },

    init(device: Device, commandBuffer: CommandBuffer) {
        _device = device;
        _commandBuffer = commandBuffer;
    }
}