import { Runtime } from "pk";

declare const puttyknife: any

export const fn = puttyknife.exports;
export const heap = new Runtime;

export * from 'pk';
