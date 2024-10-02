import type { Player } from "./player";
export function Room(name: string, id: string): Room {
    const players: Player[] = [];
    return { players, name, id, get asKey() { return name + '#' + id; } };
};

export type Room = {
    readonly players: Player[];
    readonly name: string;
    readonly id: string;
    readonly asKey: string;
};