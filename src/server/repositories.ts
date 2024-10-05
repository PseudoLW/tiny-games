import type { Player } from "./core/player";
import type { Room } from "./core/room";
import { Repository } from "./repositories/$repository";
import { randomBytes, randomInt } from 'crypto';
import { generateKey } from "./util";
export const buildRepositories = () => {
    return {
        Room: Repository<Room>(),
        Player: Repository<Player>()
    };
};

export const tokenBank = () => {
    const bank: Record<string, { room: string, player: string; }> = {};
    return {

        generate(room: string, player: string) {
            const key = generateKey(
                () => randomBytes(64).toString('base64url'),
                (k) => k in bank)!;
            bank[key] = { room, player };
            return key;
        },
        get(key: string) {
            return bank[key];
        },

        remove(key: string) {
            delete bank[key];
        }
    };
};
export type TokenBank = ReturnType<typeof tokenBank>;