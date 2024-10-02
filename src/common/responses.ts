import { array, InferOutput, literal, nullable, object, string, union } from "valibot";

export const responseValidators = {
    '/createRoom': union([
        object({ success: literal(true), roomId: string(), currentPlayers: array(string()) }),
        object({ success: literal(false), roomError: nullable(string()), hostError: nullable(string()) })
    ]),
    '/joinRoom': union([
        object({ success: literal(true), currentPlayers: array(string()) }),
        object({ success: literal(false), roomError: nullable(string()), playerError: nullable(string()) })
    ])
};

export type ResponseJSONs = {
    [k in keyof typeof responseValidators]: InferOutput<typeof responseValidators[k]>
};
