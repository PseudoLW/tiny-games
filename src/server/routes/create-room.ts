import { randomInt } from 'crypto';
import { flatten, safeParse } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { Repository } from "../repositories/$repository";
import { RouteFunction } from "./$type";

export const createRoom: (roomRepo: Repository<Room>, playerRepo: Repository<Player>) => RouteFunction =
    (roomRepo, playerRepo) => async (req) => {
        const parseResult = safeParse(requestValidators["/createRoom"], await req.json());
        let out: ResponseJSONs['/createRoom'];
        if (parseResult.success) {
            const { roomName, hostName } = parseResult.output;
            let roomId: string;
            let chance = 20;
            do {
                roomId = randomInt(10000).toString().padStart(4, '0');
                chance--;
                if (chance === 0) {
                    out = {
                        success: false, hostError: null,
                        roomError: 'Failed to create a room with this name. Try another name.',
                    };
                    return Response.json(out);
                }
            } while (roomRepo.hasKey(roomName + '#' + roomId));

            const room = Room(roomName, roomId);
            const player = Player(hostName, 'ff0000', room);

            roomRepo.add(room);
            playerRepo.add(player);

            room.players.push(player);
            out = { success: true, roomId, currentPlayers: [player.name] };
        } else {
            const issues = flatten(parseResult.issues).nested!;
            out = {
                success: false,
                roomError: issues['roomName']?.[0] ?? null,
                hostError: issues['hostName']?.[0] ?? null
            };
        }
        return Response.json(out);
    }

