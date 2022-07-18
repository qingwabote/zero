import Component from "./Component.js";
import { Transform } from "./gfx.js";
import quat, { Quat } from "./math/quat.js";
import vec3, { Vec3 } from "./math/vec3.js";

type ComponentConstructor<T> = new (...args: ConstructorParameters<typeof Component>) => T;

export default class Node implements Transform {
    private _components: Component[] = [];

    private _rotation: Quat = quat.create()
    get rotation(): Readonly<Quat> {
        return this._rotation;
    }

    set rotation(value: Readonly<Quat>) {
        Object.assign(this._rotation, value);
    }

    get euler(): Readonly<Vec3> {
        return quat.toEuler(vec3.create(), this._rotation);
    }

    set euler(value: Readonly<Vec3>) {
        quat.fromEuler(this._rotation, value[0], value[1], value[2])
    }

    position: Readonly<Vec3> = vec3.create();

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