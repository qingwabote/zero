declare const kind: unique symbol;

declare type EnumValue<T> = { readonly [kind]: T }

declare type ValueOf<T> = T[keyof T];

export declare const Filter: {
    readonly NEAREST: EnumValue<'Filter_NEAREST'>;
    readonly LINEAR: EnumValue<'Filter_LINEAR'>;
}
export declare type Filter = ValueOf<typeof Filter>

export declare const BufferUsageFlagBits: {
    readonly NONE: EnumValue<'BufferUsageFlagBits_NONE'>;
    readonly TRANSFER_DST: EnumValue<'BufferUsageFlagBits_TRANSFER_DST'>;
    readonly UNIFORM: EnumValue<'BufferUsageFlagBits_UNIFORM'>;
    readonly INDEX: EnumValue<'BufferUsageFlagBits_INDEX'>;
    readonly VERTEX: EnumValue<'BufferUsageFlagBits_VERTEX'>;
}
export declare type BufferUsageFlagBits = ValueOf<typeof BufferUsageFlagBits>

export declare const ShaderStageFlagBits: {
    readonly NONE: EnumValue<'ShaderStageFlagBits_NONE'>;
    readonly VERTEX: EnumValue<'ShaderStageFlagBits_VERTEX'>;
    readonly FRAGMENT: EnumValue<'ShaderStageFlagBits_FRAGMENT'>;
}
export declare type ShaderStageFlagBits = ValueOf<typeof ShaderStageFlagBits>

export declare const BlendFactor: {
    readonly ZERO: EnumValue<'BlendFactor_ZERO'>;
    readonly ONE: EnumValue<'BlendFactor_ONE'>;
    readonly SRC_ALPHA: EnumValue<'BlendFactor_SRC_ALPHA'>;
    readonly ONE_MINUS_SRC_ALPHA: EnumValue<'BlendFactor_ONE_MINUS_SRC_ALPHA'>;
    readonly DST_ALPHA: EnumValue<'BlendFactor_DST_ALPHA'>;
    readonly ONE_MINUS_DST_ALPHA: EnumValue<'BlendFactor_ONE_MINUS_DST_ALPHA'>;
}
export declare type BlendFactor = ValueOf<typeof BlendFactor>

export declare const PrimitiveTopology: {
    readonly POINT_LIST: EnumValue<'PrimitiveTopology_POINT_LIST'>;
    readonly LINE_LIST: EnumValue<'PrimitiveTopology_LINE_LIST'>;
    readonly TRIANGLE_LIST: EnumValue<'PrimitiveTopology_TRIANGLE_LIST'>;
}
export declare type PrimitiveTopology = ValueOf<typeof PrimitiveTopology>