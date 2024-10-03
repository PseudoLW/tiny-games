import { flatten, safeParse } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { Repository, RepositoryError, RepositoryErrorType } from "../repositories/$repository";
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
            try {
                const player = room.addPlayer(playerName, '000000');
                playerRepo.add(player);
            } catch (e) {
                if (e instanceof RepositoryError && e.type === RepositoryErrorType.AlreadyExists) {
                    out = {
                        success: false,
                        roomError: null,
                        playerError: 'Player with this name already exists in this room'
                    };
                    return Response.json(out);
                }
            }

            out = {
                success: true,
                currentPlayers: room.playerNames
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

