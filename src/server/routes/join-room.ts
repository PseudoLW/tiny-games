import { flatten, safeParse } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { Repository } from "../repositories/$repository";
import { RouteFunction } from "./$type";

export const joinRoom: (roomRepo: Repository<Room>, playerRepo: Repository<Player>) => RouteFunction =
    (roomRepo, playerRepo) => async (req) => {
        let out: ResponseJSONs['/joinRoom'];
        const data = await req.json();
        const parseResult = safeParse(requestValidators["/joinRoom"], data);
        if (parseResult.success) {
            const { roomId, playerName } = parseResult.output;
            if (!roomRepo.hasKey(roomId)) {
                out = {
                    success: false,
                    roomError: "A room with that id can't be found.",
                    playerError: null
                };
                return Response.json(out, { status: 404 });
            }
            const room = roomRepo.get(roomId);
            const player = Player(playerName, '000000', room);
            playerRepo.add(player);

            room.players.push(player);
            out = {
                success: true,
                currentPlayers: room.players.map(s => s.name)
            };
            return Response.json(out);
        } else {
            const issues = flatten(parseResult.issues).nested!;
            out = {
                success: false,
                roomError: issues['roomId']?.[0] ?? null,
                playerError: issues['playerName']?.[0] ?? null
            };
            return Response.json(out, { status: 400 });
        }
    }

