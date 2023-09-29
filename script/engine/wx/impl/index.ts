import './webgl2.js';
//
import { Device } from "gfx";
import WXLoader from '../WXLoader.js';

declare const zero: any;

zero.device = new Device;
zero.loader = new WXLoader(zero.project_path);
