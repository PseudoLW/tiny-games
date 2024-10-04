export function generateKey<T extends string | number>(
    generator: () => T,
    isInsideRecord: (key: T) => boolean,
    attempts: number = Infinity
) {
    let key: T;
    do {
        key = generator();
        attempts--;
        if (attempts <= 0) {
            return undefined;
        }
    } while (isInsideRecord(key));
    return key;
}