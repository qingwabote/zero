import { Component } from "./Component.js";
import { Zero } from "./Zero.js";
import { Transform } from "./render/scene/Transform.js";

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;
type AbstractConstructor<T> = abstract new (...args: ConstructorParameters<typeof Component>) => T;

export class Node extends Transform {

    private _components: Component[] = [];

    constructor(name: string = '') {
        super(name);
    }

    addComponent<T extends Component>(constructor: ComponentConstructor<T>): T {
        const component = new constructor(this);
        Zero.instance.addComponent(component);
        this._components.push(component);
        return component;
    }

    getComponent<T extends Component>(constructor: AbstractConstructor<T>): T | null {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component
            }
        }
        return null
    }
}