import Shader, { ShaderInfo, ShaderStageFlags } from "../../../core/Shader.js";

interface Layout {
    set: number;
    binding: number;
}

export default class WebShader extends Shader {
    // private _attributes: Attribute[];
    // get attributes(): Attribute[] {
    //     return this._attributes;
    // }

    private _gl: WebGL2RenderingContext;

    private _program!: WebGLProgram;
    get program(): WebGLProgram {
        return this._program;
    }

    constructor(gl: WebGL2RenderingContext, info: ShaderInfo) {
        super(info);
        this._gl = gl;

        const uniform2layout: Record<string, Layout> = {};
        const shaders = [];
        for (const stage of info.stages) {
            let source = stage.source;
            if (stage.type == ShaderStageFlags.VERTEX) {

            }

            source = source.replace(/layout\s*\(\s*set\s*=\s*(\d)\s*,\s*binding\s*=\s*(\d)\s*\)\s*uniform\s*(\w+)/, function (_, set, binding, name): string {
                uniform2layout[name] = { set: parseInt(set), binding: parseInt(binding) }
                return `uniform ${name}`;
            })

            source = `#version 300 es\n${source}`

            const shader = gl.createShader(stage.type == ShaderStageFlags.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`${stage.type == ShaderStageFlags.VERTEX ? "VertexShader" : "FragmentShader"} in '${info.name}' compilation failed.`);
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
            console.error(`Failed to link shader '${info.name}'.`);
            console.error(gl.getProgramInfoLog(program));
            return;
        }

        for (const name in uniform2layout) {
            const layout = uniform2layout[name];
            const index = gl.getUniformBlockIndex(program, name);
            gl.uniformBlockBinding(program, index, layout.binding)
        }

        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }

        this._program = program;
    }
}