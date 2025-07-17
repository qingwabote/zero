import { CommandBuffer } from "gfx";
import { Component } from "./Component.js";

class Escapee {
    private _components: Set<Component> = new Set;

    addComponent<T extends Component>(constructor: new () => T): T {
        const component = new constructor();
        this._components.add(component);
        return component;
    }

    render(cmd: CommandBuffer): void {
        for (const com of this._components) {
            com.render(cmd);
        }
    }
}

export const escapee = new Escapee;