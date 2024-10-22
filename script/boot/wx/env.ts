declare const wx: any;

const windowInfo = wx.getWindowInfo();

const pixelRatio: number = windowInfo.pixelRatio;
const pixelWidth: number = windowInfo.windowWidth * pixelRatio;
const pixelHeight: number = windowInfo.windowHeight * pixelRatio;

const canvas = wx.createCanvas()
canvas.width = pixelWidth;
canvas.height = pixelHeight;
const gl = canvas.getContext('webgl2', { antialias: false })!;

globalThis.WebGL2RenderingContext = gl;

export { gl, pixelRatio, windowInfo };

