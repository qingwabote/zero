import Node from "./Node.js";

export default abstract class Component {
    private _microStartInvoked = false;
    private _microUpdateRequested = false;

    constructor(readonly node: Node) { }

    protected requestMicroUpdate(): void {
        if (this._microUpdateRequested) {
            return;
        }
        Promise.resolve().then(() => {
            if (!this._microStartInvoked) {
                this.microStart();
                this._microStartInvoked = true;
            }
            this.microUpdate();
            this._microUpdateRequested = false;
        });
        this._microUpdateRequested = true;
    }

    protected microStart(): void { }

    protected microUpdate(): void { }

    start(): void { }

    update(): void { }

    lateUpdate(): void { }
}