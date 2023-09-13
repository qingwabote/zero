import { WebDevice, WebImpl } from "gfx-webgl";
import WXLoader from "./WXLoader.js";

declare const wx: any;

const zero = (globalThis as any).zero;

const canvas = wx.createCanvas()
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })!;
zero.device = new WebDevice(gl, canvas.width, canvas.height);
zero.loader = new WXLoader(zero.project_path);
zero.gfx = new WebImpl;