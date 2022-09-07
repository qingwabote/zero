import Shader, { ShaderInfo, ShaderStage, ShaderStageFlagBits, Uniform } from "../../../core/gfx/Shader.js";

export default class WebShader implements Shader {
    private _gl: WebGL2RenderingContext;

    protected _info!: ShaderInfo;
    get info(): ShaderInfo {
        return this._info;
    }

    private _program!: WebGLProgram;
    get program(): WebGLProgram {
        return this._program;
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
    }

    initialize(info: ShaderInfo): void {
        this._info = info;
        this.compileShader(info.stages, info.meta.blocks, info.meta.samplerTextures);
    }

    protected compileShader(stages: ShaderStage[], blocks: Record<string, Uniform>, samplerTextures: Record<string, Uniform>): void {
        const gl = this._gl;

        const shaders: WebGLShader[] = [];
        for (const stage of stages) {
            const source = `#version 300 es\n${stage.source}`

            const shader = gl.createShader(stage.type == ShaderStageFlagBits.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`${stage.type == ShaderStageFlagBits.VERTEX ? "VertexShader" : "FragmentShader"} in '${this._info.name}' compilation failed.`);
                console.error(gl.getShaderInfoLog(shader));
                let lineNumber = 1;
                console.error('Shader source dump:', source.replace(/^|\n/g, () => `\n${lineNumber++} `));
                return;
            }
            shaders.push(shader);
        }

        const program = gl.createProgram()!;
        for (const shader of shaders) {
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Failed to link shader '${this._info.name}'.`);
            console.error(gl.getProgramInfoLog(program));
            return;
        }

        for (const name in blocks) {
            const block = blocks[name];
            const index = gl.getUniformBlockIndex(program, name);
            gl.uniformBlockBinding(program, index, block.binding + block.set * 10)
        }

        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }

        this._program = program;
    }
}