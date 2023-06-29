import { FloatVector, ShaderInfo, ShaderStage, ShaderStageFlagBits, StringVector, Vector } from "../../../main/core/gfx/info.js";

export class WebVector<T> implements Vector<T> {
    readonly data: Array<T> = [];

    size(): number {
        return this.data.length
    }
    get(i: number): T {
        return this.data[i];
    }
    add(v: T): void {
        this.data.push(v);
    }
}

export class WebShaderStage implements ShaderStage {
    type: ShaderStageFlagBits = 0;
    source: string = '';
}

export class WebShaderInfo implements ShaderInfo {
    sources: StringVector = new WebVector;
    types: FloatVector = new WebVector;
}
