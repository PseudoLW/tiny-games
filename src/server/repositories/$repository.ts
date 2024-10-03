export function Repository<T extends { asKey: string; }>() {
    const repo: Record<string, T> = {};
    return {
        add(item: T) {
            const key = item.asKey;
            if (key in repo) {
                throw new RepositoryError(RepositoryErrorType.AlreadyExists);
            }
            repo[key] = item;
        },
        delete(item: T) {
            const key = item.asKey;
            if (!(key in repo)) {
                throw new RepositoryError(RepositoryErrorType.DoesNotExist);
            }
            delete repo[key];
        },
        has(item: T) {
            return item.asKey in repo;
        },
        hasKey(key: string) {
            return key in repo;
        },
        map<V>(mapper: (f: T) => V) {
            return Object.values(repo).map(mapper);
        },
        get(key: string) {
            const out = repo[key];
            if (out) {
                return out;
            }
            throw new RepositoryError(RepositoryErrorType.DoesNotExist);
        }
    };
}
export type Repository<T extends { asKey: string; }> = ReturnType<typeof Repository<T>>;
export const enum RepositoryErrorType {
    AlreadyExists = 'Key already exists',
    DoesNotExist = 'Key does not exist',
}
export class RepositoryError extends Error {
    constructor(public readonly type: RepositoryErrorType) {
        super(`Repository error: ${type}`);
    }
}