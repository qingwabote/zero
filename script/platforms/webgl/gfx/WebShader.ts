import { Shader, ShaderInfo, ShaderStageBit } from "../../../core/gfx.js";

export default class WebShader extends Shader {
    private _gl: WebGL2RenderingContext;

    private _program!: WebGLProgram;
    get program(): WebGLProgram {
        return this._program;
    }

    constructor(gl: WebGL2RenderingContext, info: ShaderInfo) {
        super(info);
        this._gl = gl;
        const shaders = [];
        for (const stage of info.stages) {
            const shader = gl.createShader(stage.type == ShaderStageBit.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
            gl.shaderSource(shader, stage.source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`${stage.type == ShaderStageBit.VERTEX ? "VertexShader" : "FragmentShader"} in '${info.name}' compilation failed.`);
                console.error(gl.getShaderInfoLog(shader));
                let lineNumber = 1;
                console.error('Shader source dump:', stage.source.replace(/^|\n/g, () => `\n${lineNumber++} `));
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

        //After the link operation, applications are free to modify attached shader objects, compile attached shader objects, detach shader objects, delete shader objects, and attach additional shader objects. None of these operations affects the information log or the program that is part of the program object
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }

        this._program = program;
    }
}