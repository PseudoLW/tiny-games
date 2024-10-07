import { flatten, parse, ValiError } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { TokenBank } from "../repositories";
import { Repository } from "../repositories/$repository";
import { PlayerAlreadyExistsError, PlayerRepository, Ready } from "../repositories/playerRepository";
import { RouteFunction } from "./$type";

export const joinRoom: (
    roomRepo: Repository<Room>,
    playerRepo: Repository<Player>,
    tokenBank: TokenBank,
    newRepo: PlayerRepository
) => RouteFunction =
    (roomRepo, playerRepo, tokenBank, repo) => async (req) => {
        const data = await req.json();
        const response = (s: ResponseJSONs['/joinRoom']) => Response.json(s);
        try {
            const result = parse(requestValidators['/joinRoom'], data);
            const { roomId: roomKey, playerName } = result;
            const roomIdentifier = (() => { const [roomName, roomNumber] = roomKey.split('#'); return { roomName, roomNumber }; })();
            if (!repo.hasRoom(roomIdentifier)) throw RoomDoesNotExistsError;

            const token = repo.generatePlayerToken();
            const player = repo.create(token, { name: playerName, ...roomIdentifier });

            return response({
                success: true, currentPlayers: repo.getPlayersInRoom(player.id).map(s => ({
                    name: s.id.name,
                    ready: s.gameData === Ready
                })),
                playerName,
                roomName: roomIdentifier.roomName,
                roomIdNumber: roomIdentifier.roomNumber,
                websocketToken: token
            });
        } catch (e) {
            if (e instanceof ValiError) {
                const issues = flatten(e.issues).nested!;
                return response({
                    success: false,
                    roomError: issues['roomId']?.[0] ?? null,
                    playerError: issues['playerName']?.[0] ?? null
                });
            } else if (e instanceof RoomDoesNotExistsError) {
                return response({
                    success: false, roomError: null,
                    playerError: "A room with that id can't be found."
                });
            } else if (e instanceof PlayerAlreadyExistsError) {
                return response({
                    success: false, roomError: null,
                    playerError: 'Player with this name already exists in this room'
                });
            } else {
                return response({ success: false, roomError: null, playerError: null });
            }
        }
    };

class RoomDoesNotExistsError extends Error {
    constructor() {
        super('Room does not exists');
    }
}