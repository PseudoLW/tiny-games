import type { Player } from "./core/player";
import type { Room } from "./core/room";
import { Repository } from "./repositories/$repository";

export const buildRepositories = () => {
    return {
        Room: Repository<Room>(),
        Player: Repository<Player>()
    };
};