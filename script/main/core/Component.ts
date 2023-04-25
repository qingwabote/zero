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

    /**micro start/update may not be invoked before the normal start/update, 
     * but it can be sure that the micro start/update of nested component can be invoked in time rather than delayed to the next tick.
     * it be used to update child component in composite component.*/
    protected microStart(): void { }
    protected microUpdate(): void { }

    start(): void { }
    update(): void { }
    lateUpdate(): void { }
}