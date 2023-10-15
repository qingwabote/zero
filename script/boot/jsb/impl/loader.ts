declare const zero: any

(globalThis as any).loader = {
    impl: zero.Window.instance().loader()
};