import { Culling } from "./data/Culling.js";
import { Shadow } from "./data/Shadow.js";

export class Data {
    public shadow: Shadow | null = null;
    public culling: Culling | null = new Culling;

    update(dumping: boolean) {
        this.shadow?.update(dumping);
    }

    cull() {
        this.culling?.update(this.shadow)
    }
}