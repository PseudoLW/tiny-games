import { flatten, safeParse } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { Repository, RepositoryError, RepositoryErrorType } from "../repositories/$repository";
import { RouteFunction } from "./$type";
import { TokenBank } from "../repositories";

export const joinRoom: (
    roomRepo: Repository<Room>,
    playerRepo: Repository<Player>,
    tokenBank: TokenBank
) => RouteFunction =
    (roomRepo, playerRepo, tokenBank) => async (req) => {
        const data = await req.json();
        const parseResult = safeParse(requestValidators["/joinRoom"], data);
        const response = (s: ResponseJSONs['/joinRoom']) => Response.json(s);
        if (parseResult.success) {
            const { roomId, playerName } = parseResult.output;
            if (!roomRepo.hasKey(roomId)) {
                return response({
                    success: false, playerError: null,
                    roomError: "A room with that id can't be found.",
                });
            }
            const room = roomRepo.get(roomId);
            try {
                const player = room.addPlayer(playerName, '000000');
                playerRepo.add(player);
            } catch (e) {
                if (e instanceof RepositoryError && e.type === RepositoryErrorType.AlreadyExists) {
                    return response({
                        success: false, roomError: null,
                        playerError: 'Player with this name already exists in this room'
                    });
                }
            }

            return response({
                success: true, currentPlayers: room.playerNames,
                websocketToken: tokenBank.generate(room.asKey, playerName)
            });
        } else {
            const issues = flatten(parseResult.issues).nested!;
            return response({
                success: false,
                roomError: issues['roomId']?.[0] ?? null,
                playerError: issues['playerName']?.[0] ?? null
            });
        }
    }

