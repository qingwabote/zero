import Component from "./Component.js";
import { Transform } from "./gfx.js";

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;

export default class Node implements Transform {
    private _components: Component[] = [];

    x: number = 0;
    y: number = 0;
    z: number = 0;

    eulerX: number = 0;
    eulerY: number = 0;
    eulerZ: number = 0;

    addComponent<T extends Component>(constructor: ComponentConstructor<T>): T {
        const component = new constructor(this);
        this._components.push(component);

        return component;
    }

    getComponent<T extends Component>(constructor: ComponentConstructor<T>): T | null {
        for (const component of this._components) {
            if (component instanceof constructor) {
                return component
            }
        }
        return null
    }
}