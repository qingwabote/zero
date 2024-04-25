import { ShaderStageFlagBits, glsl } from "gfx-common";
export class Shader {
    get info() {
        return this._info;
    }
    get impl() {
        return this._impl;
    }
    constructor(gl) {
        this._gl = gl;
    }
    initialize(info) {
        this._info = info;
        return this.compileShader(info);
    }
    compileShader(info) {
        const gl = this._gl;
        const sources = info.sources.data;
        const types = info.types.data;
        const shaders = [];
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            // remove unsupported layout qualifier for WebGL, e.g. descriptor sets, no such concept in WebGL, even OpenGL
            source = source.replace(/layout.*uniform/g, 'uniform');
            if (types[i] == ShaderStageFlagBits.VERTEX) {
                source = source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*out/g, 'out');
            }
            else {
                source = source.replace(/layout\s*\(\s*location\s*=\s*\d\s*\)\s*in/g, 'in');
            }
            source = `#version 300 es\n${source}`;
            const shader = gl.createShader(types[i] == ShaderStageFlagBits.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                let err = `${types[i] == ShaderStageFlagBits.VERTEX ? "VertexShader" : "FragmentShader"} in compilation failed.\n`;
                err += gl.getShaderInfoLog(shader) + '\n';
                let lineNumber = 1;
                err += 'Shader source dump:', source.replace(/^|\n/g, () => `\n${lineNumber++} `);
                throw new Error(err);
            }
            shaders.push(shader);
        }
        const program = gl.createProgram();
        for (const shader of shaders) {
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Failed to link shader.\n' + gl.getProgramInfoLog(program));
        }
        const meta = glsl.parse(sources, types);
        for (const name in meta.blocks) {
            const block = meta.blocks[name];
            const index = gl.getUniformBlockIndex(program, name);
            gl.uniformBlockBinding(program, index, block.binding + block.set * 10);
        }
        gl.useProgram(program);
        for (const name in meta.samplerTextures) {
            const sampler = meta.samplerTextures[name];
            const loc = gl.getUniformLocation(program, name);
            if (!loc)
                continue;
            if (sampler.binding > 1 || sampler.set > 3) {
                console.warn(`sampler.binding(${sampler.binding}) > 1 || sampler.set${sampler.set} > 3`);
                continue;
            }
            const unit = sampler.set * 2 + sampler.binding;
            gl.uniform1i(loc, unit); // set texture unit
        }
        gl.useProgram(null);
        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }
        this._impl = program;
        return false;
    }
}
