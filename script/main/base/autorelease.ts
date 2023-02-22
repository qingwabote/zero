const registry = new FinalizationRegistry((params: [obj: any, deleter: Function, thisArg?: object]) => {
    params[1].call(params[2], params[0]);
})

export default {
    add<T>(host: object, obj: T, deleter: (obj: T) => void, thisArg?: object): T {
        registry.register(host, [obj, deleter, thisArg]);
        return obj;
    }
}