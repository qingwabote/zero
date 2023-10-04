declare const wx: any;

const canvas = wx.createCanvas()
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
(globalThis as any).gfx = {
    context: gl
}
globalThis.WebGL2RenderingContext = gl;

export { };
