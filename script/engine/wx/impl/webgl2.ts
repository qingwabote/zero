declare const wx: any;

// for gfx webgl2
const canvas = wx.createCanvas()
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
(globalThis as any).gfx = {
    context: gl,
}
globalThis.WebGL2RenderingContext = gl;

export { }; // for systemjs. https://www.typescriptlang.org/docs/handbook/2/modules.html#non-modules

