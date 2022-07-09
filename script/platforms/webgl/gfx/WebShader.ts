import Shader, { ShaderStage, ShaderStageFlags, Uniform } from "../../../core/gfx/Shader.js";

export default class WebShader extends Shader {
    private _gl: WebGL2RenderingContext;

    private _program!: WebGLProgram;
    get program(): WebGLProgram {
        return this._program;
    }

    constructor(gl: WebGL2RenderingContext) {
        super();
        this._gl = gl;
    }

    protected override compileUniform(content: string, set: string, binding: string, type: string, name: string): string {
        super.compileUniform(content, set, binding, type, name);
        return type ? `uniform ${type} ${name}` : `uniform ${name}`;
    }

    protected compileShader(stages: ShaderStage[], blocks: Record<string, Uniform>, samplerTextures: Record<string, Uniform>): void {
        const gl = this._gl;

        const shaders: WebGLShader[] = [];
        for (const stage of stages) {
            const source = `#version 300 es\n${stage.source}`

            const shader = gl.createShader(stage.type == ShaderStageFlags.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`${stage.type == ShaderStageFlags.VERTEX ? "VertexShader" : "FragmentShader"} in '${this._info.name}' compilation failed.`);
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