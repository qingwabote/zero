import { BlendState, DepthStencilState, DescriptorSet, DescriptorSetLayout, RasterizationState, Shader } from "gfx";

interface State {
    readonly shader: Shader;
    readonly rasterizationState?: RasterizationState;
    readonly depthStencilState?: DepthStencilState;
    readonly blendState?: BlendState
}

export interface Pass {
    readonly type: string;
    readonly state: State;
    readonly descriptorSetLayout: DescriptorSetLayout;
    readonly descriptorSet: DescriptorSet | undefined;

    upload(): void;
}

export declare namespace Pass {
    export { State }
}