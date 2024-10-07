import { flatten, parse, ValiError } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { PlayerIdentifier, PlayerRepository, TokenCreationFailureError } from '../playerRepository';
import { RouteFunction } from "./$type";

export const createRoom: (repo: PlayerRepository) => RouteFunction = (repo) => async (req) => {
    const response = (s: ResponseJSONs['/createRoom']) => Response.json(s);
    try {
        const result = parse(requestValidators["/createRoom"], await req.json());
        const { roomName, hostName } = result;
        const roomNumber = repo.generateRoomNumber(roomName);
        const token = repo.generatePlayerToken();
        const playerId: PlayerIdentifier = {
            name: hostName, roomName, roomNumber
        };
        repo.create(token, playerId);

        return response({
            success: true, playerName: hostName,
            roomIdNumber: roomNumber, roomName,
            currentPlayers: [{ name: hostName, ready: false }],
            websocketToken: token
        });
    } catch (e) {
        if (e instanceof ValiError) {
            const issues = flatten(e.issues).nested!;
            return response({
                success: false,
                roomError: issues['roomName']?.[0] ?? null,
                playerError: issues['hostName']?.[0] ?? null
            });
        } else if (e instanceof TokenCreationFailureError) {
            return response({
                success: false, playerError: null,
                roomError: 'Failed to create a room with this name. Try another name.',
            });
        } else {
            throw e;
        }
    }
}

