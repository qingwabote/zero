import { Zero } from "./Zero.js";
import { Transform } from "./render/scene/Transform.js";
export class Node extends Transform {
    static build(constructor) {
        return (new Node(constructor.name).addComponent(constructor));
    }
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
    getComponent(constructor, recursive = false) {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component;
            }
        }
        if (recursive) {
            for (const child of this.children) {
                const component = child.getComponent(constructor, recursive);
                if (component) {
                    return component;
                }
            }
        }
        return null;
    }
}
