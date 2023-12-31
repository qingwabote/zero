import { Context } from "../Context.js";

export abstract class Uniform {
    constructor(protected _context: Context) { };
    abstract update(): void;
}