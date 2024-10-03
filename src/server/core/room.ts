import { RepositoryError, RepositoryErrorType as ErrorType } from "../repositories/$repository";
import { Player } from "./player";
export function Room(name: string, id: string): Room {
    const players: Record<string, Player> = {};
    const out: Room = {
        name, id,
        get asKey() { return name + '#' + id; },
        get playerNames() { return Object.keys(players); },
        addPlayer(name, color) {
            if (name in players) {
                throw new RepositoryError(ErrorType.AlreadyExists);
            }
            const player = Player(name, color, out);
            players[name] = player;
            return player;
        },
        removePlayer(name) {
            if (!(name in players)) {
                throw new RepositoryError(ErrorType.DoesNotExist);
            }
            delete players[name];
        }

    };
    return out;
};

export type Room = {
    readonly playerNames: string[];
    readonly name: string;
    readonly id: string;
    readonly asKey: string;
    addPlayer(name: string, color: string): Player;
    removePlayer(name: string): void;
};