import { BlendState, DepthStencilState, DescriptorSet, DescriptorSetLayout, RasterizationState, Shader } from "gfx";

interface State {
    readonly shader: Shader;
    readonly rasterizationState?: RasterizationState | undefined;
    readonly depthStencilState?: DepthStencilState | undefined;
    readonly blendState?: BlendState | undefined
}

export interface Pass {
    readonly id: number;
    readonly type: string;
    readonly state: State;
    readonly descriptorSetLayout: DescriptorSetLayout;
    readonly descriptorSet: DescriptorSet | undefined;

    upload(): void;
}

export declare namespace Pass {
    export { State }
}