function str(s: unknown) {
    if (s) {
        return s.toString();
    } else { // null or undefined
        return JSON.stringify(s);
    }
}

export class DoesNotExist<T, K> extends Error {
    constructor(key: T, collection: K) {
        super(`Key ${str(key)} does not exist in ${str(collection)}`);
    };
}