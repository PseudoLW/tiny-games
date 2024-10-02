import { Room } from "./room";

export function Player(name: string, color: string, room: Room): Player {
    return { name, color, room, asKey: name + '@' + room.asKey };
};

export type Player = {
    readonly name: string;
    color: string;
    readonly room: Room;
    readonly asKey: string;
};