import { Zero } from "./Zero.js";
import { Transform } from "./render/scene/Transform.js";
export class Node extends Transform {
    constructor(name = '') {
        super(name);
        this._components = [];
    }
    addComponent(constructor) {
        const component = new constructor(this);
        Zero.instance.addComponent(component);
        this._components.push(component);
        return component;
    }
    getComponent(constructor) {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component;
            }
        }
        return null;
    }
}
