const registry = new FinalizationRegistry((params) => {
    params[1].call(params[2], params[0]);
});
export class SmartRef {
    deref() {
        return this.target;
    }
    constructor(target, deleter, thisArg) {
        this.target = target;
        registry.register(this, [target, deleter, thisArg]);
    }
}
