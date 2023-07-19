import Shader from "../../../main/core/gfx/Shader.js";
import glsl from "../../../main/core/gfx/glsl.js";
import { ShaderInfo, ShaderStageFlagBits } from "../../../main/core/gfx/info.js";
import { WebVector } from "./info.js";

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

    initialize(info: ShaderInfo): boolean {
        this._info = info;
        return this.compileShader(info);
    }

    private compileShader(info: ShaderInfo): boolean {
        const gl = this._gl;

        const sources = (info.sources as WebVector<string>).data;
        const types = (info.types as WebVector<number>).data;

        const shaders: WebGLShader[] = [];
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            // remove unsupported layout qualifier for WebGL, e.g. descriptor sets, no such concept in WebGL, even OpenGL
            source = source.replace(/layout.*uniform/g, 'uniform');
            if (types[i] == ShaderStageFlagBits.VERTEX) {
                source = source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*out/g, 'out');
            } else {
                source = source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*in/g, 'in');
            }

            source = `#version 300 es\n${source}`
            const shader = gl.createShader(types[i] == ShaderStageFlagBits.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`${types[i] == ShaderStageFlagBits.VERTEX ? "VertexShader" : "FragmentShader"} in compilation failed.`);
                console.error(gl.getShaderInfoLog(shader));
                let lineNumber = 1;
                console.error('Shader source dump:', source.replace(/^|\n/g, () => `\n${lineNumber++} `));
                return true;
            }
            shaders.push(shader);
        }

        const program = gl.createProgram()!
        for (const shader of shaders) {
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Failed to link shader.`);
            console.error(gl.getProgramInfoLog(program));
            return true;
        }

        const meta = glsl.parse(sources, types);

        for (const name in meta.blocks) {
            const block = meta.blocks[name];
            const index = gl.getUniformBlockIndex(program, name);
            gl.uniformBlockBinding(program, index, block.binding + block.set * 10)
        }

        gl.useProgram(program);
        for (const name in meta.samplerTextures) {
            const sampler = meta.samplerTextures[name];
            const loc = gl.getUniformLocation(program, name);
            if (!loc) continue;
            gl.uniform1i(loc, sampler.binding + sampler.set * 10);
        }
        gl.useProgram(null);

        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }

        this._program = program;

        return false;
    }
}