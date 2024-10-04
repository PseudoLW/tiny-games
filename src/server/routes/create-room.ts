import { randomInt } from 'crypto';
import { flatten, safeParse } from "valibot";
import { requestValidators } from "../../common/requests";
import type { ResponseJSONs } from "../../common/responses";
import { Player } from "../core/player";
import { Room } from "../core/room";
import { Repository } from "../repositories/$repository";
import { RouteFunction } from "./$type";
import { TokenBank } from '../repositories';
import { generateKey } from '../util';

export const createRoom: (
    roomRepo: Repository<Room>,
    playerRepo: Repository<Player>,
    bank: TokenBank
) => RouteFunction = (roomRepo, playerRepo, tokenBank) => async (req) => {
    const parseResult = safeParse(requestValidators["/createRoom"], await req.json());
    const response = (s: ResponseJSONs['/createRoom']) => Response.json(s);
    if (parseResult.success) {
        const { roomName, hostName } = parseResult.output;
        const roomId = generateKey(
            () => randomInt(10000).toString().padStart(4, '0'),
            (k) => roomRepo.hasKey(roomName + '#' + k),
            20);
        if (roomId === undefined) {
            return response({
                success: false, hostError: null,
                roomError: 'Failed to create a room with this name. Try another name.',
            });
        }

        const room = Room(roomName, roomId);
        const player = room.addPlayer(hostName, 'ff0000');
        roomRepo.add(room);
        playerRepo.add(player);
        return response({ success: true, roomId, currentPlayers: [player.name], websocketToken: tokenBank.generate() });
    } else {
        const issues = flatten(parseResult.issues).nested!;
        return response({
            success: false,
            roomError: issues['roomName']?.[0] ?? null,
            hostError: issues['hostName']?.[0] ?? null
        });
    }
}

