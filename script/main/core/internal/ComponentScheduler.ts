import Component from "../Component.js";

export default class ComponentScheduler {
    private _busying = false;

    private _addingQueue: Component[] = [];

    /**Elements that are added (and are not already part of the collection) during the iteration will always be iterated
     * https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration*/
    private _components: Map<Component, boolean> = new Map;

    add(com: Component): void {
        if (this._busying) {
            this._addingQueue.push(com);
            return;
        }
        this.schedule(com);
    }

    update() {
        for (const [com, starting] of this._components) {
            if (starting) {
                com.start();
                this._components.set(com, false);
            }
            com.update();
        }
    }

    lateUpdate() {
        this._busying = true;
        for (const com of this._components.keys()) {
            com.lateUpdate()
        }
        for (const com of this._addingQueue) {
            this.schedule(com);
        }
        this._addingQueue.length = 0;
        this._busying = false;
    }

    private schedule(com: Component) {
        this._components.set(com, true);
    }
}