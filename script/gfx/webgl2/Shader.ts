import { ShaderStageFlagBits, glsl } from "gfx-common";
import { ShaderInfo } from "./info.js";
import { PipelineLayout } from "./PipelineLayout.js";

export class Shader {
    private _impl!: WebGLProgram;
    get impl(): WebGLProgram {
        return this._impl;
    }

    private readonly _meta: glsl.Meta;

    private _layout!: PipelineLayout;

    constructor(private _gl: WebGL2RenderingContext, readonly info: ShaderInfo) {
        this._meta = glsl.parse(info.sources.data, info.types.data);
    }

    initialize(): boolean {
        return this.compileShader(this.info);
    }

    setLayout(layout: PipelineLayout) {
        if (this._layout == layout) {
            return;
        }

        const gl = this._gl;
        const program = this._impl;

        const meta = this._meta;
        for (const name in meta.blocks) {
            const block = meta.blocks[name];
            const index = gl.getUniformBlockIndex(program, name);
            gl.uniformBlockBinding(program, index, layout.getFlatBinding(block.set, block.binding));
        }

        gl.useProgram(program);
        for (const name in meta.samplerTextures) {
            const texture = meta.samplerTextures[name];
            const loc = gl.getUniformLocation(program, name);
            if (!loc) continue;
            gl.uniform1i(loc, layout.getFlatBinding(texture.set, texture.binding));// set texture unit
        }
        gl.useProgram(null);

        this._layout = layout;
    }

    private compileShader(info: ShaderInfo): boolean {
        const gl = this._gl;

        const sources = info.sources.data;
        const types = info.types.data;

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
                let err = `${types[i] == ShaderStageFlagBits.VERTEX ? "VertexShader" : "FragmentShader"} in compilation failed.\n`
                err += gl.getShaderInfoLog(shader) + '\n';
                let lineNumber = 1;
                err += 'Shader source dump:' + source.replace(/^|\n/g, () => `\n${lineNumber++} `)
                throw new Error(err);
            }
            shaders.push(shader);
        }

        const program = gl.createProgram()!
        for (const shader of shaders) {
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Failed to link shader.\n' + gl.getProgramInfoLog(program))
        }

        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }

        this._impl = program;

        return false;
    }
}