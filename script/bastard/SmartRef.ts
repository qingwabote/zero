const registry = new FinalizationRegistry((params: [target: any, deleter: Function, thisArg: object | undefined]) => {
    params[1].call(params[2], params[0]);
})

export class SmartRef<T> {
    deref(): T {
        return this.target;
    }

    constructor(private target: T, deleter: (target: T) => void, thisArg?: object) {
        registry.register(this, [target, deleter, thisArg]);
    }
}