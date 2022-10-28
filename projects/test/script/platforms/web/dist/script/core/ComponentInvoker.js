export class ComponentInvoker {
    _func;
    _oneOff;
    /**
     * Elements that are added (and are not already part of the collection) during the iteration will always be iterated
     * https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration
    */
    _components = new Map;
    constructor(func, oneOff) {
        this._func = func;
        this._oneOff = oneOff;
    }
    add(com) {
        this._components.set(com, com);
    }
    remove(com) {
        this._components.delete(com);
    }
    invoke(dt) {
        for (const com of this._components.keys()) {
            this._func(com, dt);
        }
        if (this._oneOff) {
            this._components.clear();
        }
    }
}
//# sourceMappingURL=ComponentInvoker.js.map