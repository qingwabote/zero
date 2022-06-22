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
    readonly size: number;
    readonly offset: number
}

export abstract class Buffer {
    protected _info: BufferInfo;
    constructor(info: BufferInfo) {
        this._info = info
    }
    abstract update(buffer: Readonly<ArrayBuffer>): void;
}

export interface Device {
    createShader(info: ShaderInfo): Shader;
    createBuffer(info: BufferInfo): Buffer;
}

export interface VertexInputBindingDescription {
    readonly binding: number;
    readonly stride: number;
}

export enum Format {
    RG32F
}

interface FormatInfo {
    readonly name: string;
    readonly size: number
    readonly count: number;
}

export const FormatInfos: Readonly<FormatInfo[]> = [
    { name: "RG32F", size: 8, count: 2 }
]

export interface VertexInputAttributeDescription {
    readonly location: number;
    readonly binding: number;
    readonly format: Format;
}

export interface PipelineVertexInput {
    readonly vertexAttributeDescriptions: VertexInputAttributeDescription[];
}

export interface Pipeline {
    readonly shader: Shader;
    readonly vertexInput: PipelineVertexInput
}

export interface CommandBuffer {
    beginRenderPass(): void;
    bindPipeline(pipeline: Pipeline): void;
    bindVertexBuffers(buffers: Buffer[], bufferBindings: number[]): void
    draw(): void;
    endRenderPass(): void
}

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