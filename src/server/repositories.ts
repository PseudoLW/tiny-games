import type { Player } from "./core/player";
import type { Room } from "./core/room";
import { Repository } from "./repositories/$repository";
import { randomInt } from 'crypto';
import { generateKey } from "./util";
export const buildRepositories = () => {
    return {
        Room: Repository<Room>(),
        Player: Repository<Player>()
    };
};

export const tokenBank = () => {
    const bank: Record<number, true> = {};
    return {
        generate() {
            return generateKey(() => randomInt(0xffff_ffff_ffff + 1), (k) => k in bank)!;
        },

        remove(key: number) {
            delete bank[key];
        }
    };
};
export type TokenBank = ReturnType<typeof tokenBank>;