import { CommandBuffer } from "gfx";

export interface Component {
    render(cmd: CommandBuffer): void;
}