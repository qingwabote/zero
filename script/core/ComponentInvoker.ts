import Component from "./Component.js";

type InvokeFunc = (com: Component, dt: number) => void;

export class ComponentInvoker {
    private _func: InvokeFunc;
    private _oneOff: boolean;
    /**
     * Elements that are added (and are not already part of the collection) during the iteration will always be iterated
     * https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration
    */
    private _components: Map<Component, Component> = new Map;

    constructor(func: InvokeFunc, oneOff: boolean) {
        this._func = func;
        this._oneOff = oneOff;
    }

    add(com: Component): void {
        this._components.set(com, com);
    }

    remove(com: Component): void {
        this._components.delete(com);
    }

    invoke(dt: number): void {
        for (const com of this._components.keys()) {
            this._func(com, dt)
        }
        if (this._oneOff) {
            this._components.clear()
        }
    }
}