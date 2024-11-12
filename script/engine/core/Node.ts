import { Component } from "./Component.js";
import { Zero } from "./Zero.js";
import { Transform } from "./render/scene/Transform.js";

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;
type AbstractConstructor<T> = abstract new (...args: ConstructorParameters<typeof Component>) => T;

export class Node extends Transform {

    static build<T extends Component>(constructor: ComponentConstructor<T>): T {
        return (new Node(constructor.name).addComponent(constructor));
    }

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

    getComponent<T extends Component>(constructor: AbstractConstructor<T>, recursive: boolean = false): T | null {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component
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
        return null
    }
}