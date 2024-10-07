import { ServerWebSocket } from 'bun';
import { randomBytes, randomInt } from 'crypto';

export type PlayerIdentifier = Readonly<{ name: string; roomName: string; roomNumber: string; }>;
export type RoomIdentifier = Readonly<{ roomName: string, roomNumber: string; }>;

export interface PlayerRepository {
    /** Obtain a player by its identifier. */
    getByIdentifier(id: PlayerIdentifier): Player;

    /** Obtain a player by its token. */
    getByToken(token: string): Player;

    /** Create a player after given */
    create(token: string, id: PlayerIdentifier): Player;

    /** Generate an available token in the repository. Does not register the token. */
    generatePlayerToken(): string;

    /** Generate an available 3-digit room id number for a room with this name. Does not register the room number. */
    generateRoomNumber(roomName: string): string;

    /** Delete a player, detaching them from a room. Last player deleted will delete a room. */
    delete(player: Player): void;

    /** Return all the players in a room. */
    getPlayersInRoom(id: RoomIdentifier): readonly Player[];

    /** Ensure if a room with such identifier exists. Otherwise, throws. */
    assertRoomExists(id: RoomIdentifier): void;
}

/** A Symbol flagging that player is ready to play a game. */
export const Ready = Symbol('Ready');

export interface Player {
    /** Name of the player. */
    readonly name: string;

    /** Identifier object of the player, consisting of name, room name, and room id number. */
    readonly id: PlayerIdentifier;

    /** The display color of the player. */
    color: string;

    /** Client token of the player */
    readonly token: string;

    /** The game data of the current player. */
    gameData: null | typeof Ready;

    /** Websocket client of the player. */
    websocket: ServerWebSocket<{ token: string; }> | null;
}

function getRoomKey({ roomName, roomNumber }: RoomIdentifier) {
    return `${roomName}#${roomNumber}`;
}
function getPlayerKey(id: PlayerIdentifier) {
    return `${id.name}@${getRoomKey(id)}`;
}

export function createPlayerRepository(): PlayerRepository {
    const playerTokens: Record<string, Player> = {};
    const rooms: Record<string, { id: RoomIdentifier; players: Player[]; }> = {};
    const playerKeys: Record<string, Player> = {};
    return {
        generatePlayerToken() {
            let key: string;
            do key = randomBytes(64).toString('base64url'); while (key in playerTokens);
            return key;
        },

        generateRoomNumber(roomName) {
            let key: string;
            let attempt = 20;
            do {
                key = randomInt(1000).toString().padStart(3, '0');
                if (attempt-- < 0) throw new TokenCreationFailureError();
            } while (`${roomName}#${key}` in rooms);
            return key;
        },

        assertRoomExists(id) {
            if (!(getRoomKey(id) in rooms)) {
                throw new RoomDoesNotExistsError();
            };
        },

        create(token, id) {
            const { name } = id;
            const playerKey = getPlayerKey(id);
            if (playerKey in playerKeys) {
                throw new PlayerAlreadyExistsError();
            }
            const player: Player = {
                name, id, token,
                color: '000000',
                gameData: null,
                websocket: null,
            };
            playerTokens[token] = player;
            playerKeys[playerKey] = player;
            const roomKey = getRoomKey(id);
            if (!(roomKey in rooms)) {
                rooms[roomKey] = { id, players: [] };
            }
            rooms[roomKey].players.push(player);
            return player;
        },

        delete(player) {
            const id = player.id;
            const playerKey = getPlayerKey(id);
            delete playerTokens[player.token];
            delete playerKeys[playerKey];
            const roomKey = getRoomKey(id);
            const room = rooms[roomKey].players;
            room.splice(room.indexOf(player), 1);

            if (room.length === 0) {
                delete rooms[roomKey];
            }
        },

        getByIdentifier(id) {
            return playerKeys[getPlayerKey(id)];
        },

        getByToken(token) {
            return playerTokens[token];
        },

        getPlayersInRoom(id) {
            const roomKey = getRoomKey(id);
            return rooms[roomKey].players;
        },
    };
}

export class TokenCreationFailureError extends Error {
    constructor() { super('Token Creation failure'); }
}

export class PlayerAlreadyExistsError extends Error {
    constructor() { super('Player already exists.'); }
}

export class RoomDoesNotExistsError extends Error {
    constructor() { super('Room does not exists'); }
}