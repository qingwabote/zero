import Component from "./Component.js";
import Transform from "./scene/Transform.js";

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;
type AbstractConstructor<T> = abstract new (...args: ConstructorParameters<typeof Component>) => T;

export default class Node extends Transform {

    private _components: Component[] = [];

    override get children(): readonly Node[] {
        return super.children as any
    }

    override get parent(): Node | undefined {
        return super.parent as any;
    }

    constructor(name: string = '') {
        super(name);
    }

    addComponent<T extends Component>(constructor: ComponentConstructor<T>): T {
        const component = new constructor(this);
        zero.addComponent(component);
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