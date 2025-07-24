export function has<T>(bits: T, bit: T): boolean {
    return ((bits as number) | (bit as number)) == bit;
}

export function or<T>(a: T, b: T): T {
    return ((a as number) | (b as number)) as T;
}