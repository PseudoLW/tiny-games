import { flatten, parse, ValiError } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { PlayerAlreadyExistsError, PlayerRepository, Ready, RoomDoesNotExistsError } from "../playerRepository";
import { RouteFunction } from "./$type";

export const joinRoom: (repo: PlayerRepository) => RouteFunction = (repo) => async (req) => {
    const data = await req.json();
    const response = (s: ResponseJSONs['/joinRoom']) => Response.json(s);
    try {
        const result = parse(requestValidators['/joinRoom'], data);
        const { roomId: roomKey, playerName } = result;
        const roomIdentifier = (() => { const [roomName, roomNumber] = roomKey.split('#'); return { roomName, roomNumber }; })();
        repo.assertRoomExists(roomIdentifier);

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
                success: false, playerError: null,
                roomError: "A room with that id can't be found."
            });
        } else if (e instanceof PlayerAlreadyExistsError) {
            return response({
                success: false, roomError: null,
                playerError: 'Player with this name already exists in this room'
            });
        } else {
            throw e;
        }
    }
};

