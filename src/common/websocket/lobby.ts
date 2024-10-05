import { InferOutput, literal, object, pipe, regex, string, union } from "valibot";

const completePlayerIdRegex = /^[A-Za-z0-9\-]{2,30}@[A-Za-z0-9\-]{4,30}#[0-9]{4}$/;
export const lobbyMessageValidator = union([
    // Initialization
    object({
        type: literal('init'),
        id: pipe(string(), regex(completePlayerIdRegex)),
    })
]);

export type LobbyMessageToServer = InferOutput<typeof lobbyMessageValidator>;

export type LobbyMessageToClient = {
    type: 'ping';
    state: number;
} | {
    type: 'player-update';
    players: { name: string; ready: boolean; }[];
};