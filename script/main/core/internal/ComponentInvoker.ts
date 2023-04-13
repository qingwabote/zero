import Component from "../Component.js";

export class ComponentInvoker {
    /**
     * Elements that are added (and are not already part of the collection) during the iteration will always be iterated
     * https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration
    */
    private _components: Map<Component, Component> = new Map;

    constructor(private _func: (com: Component) => void, private _oneOff: boolean) { }

    add(com: Component): void {
        this._components.set(com, com);
    }

    remove(com: Component): void {
        this._components.delete(com);
    }

    invoke(): void {
        for (const com of this._components.keys()) {
            this._func(com)
        }
        if (this._oneOff) {
            this._components.clear()
        }
    }
}