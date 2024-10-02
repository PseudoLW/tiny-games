import { string, minLength, maxLength, regex, pipe, InferOutput, object, safeParse, flatten } from "valibot";

const nameRegex = /^[A-Za-z0-9\-]+$/;
export const requestValidators = {
    '/createRoom': object({
        hostName: pipe(
            string('Your name has to be a string.'),
            minLength(2, 'Your name has to be at least 2 characters'),
            maxLength(30, 'Your name has to be at most 30 characters'),
            regex(nameRegex, 'Your name can only contain letters, numbers, and -.')),
        roomName: pipe(
            string("The room's name has to be a string."),
            minLength(4, "The room's name has to be at least 4 characters"),
            maxLength(30, "The room's name has to be at most 30 characters"),
            regex(nameRegex, "The room's name can only contain letters, numbers, and -.")),
    }),
    '/joinRoom': object({
        playerName: pipe(
            string('Your name has to be a string.'),
            minLength(2, 'Your name has to be at least 2 characters'),
            maxLength(30, 'Your name has to be at most 30 characters'),
            regex(nameRegex, 'Your name can only contain letters, numbers, and -.')),
        roomId: string()
    })
};

export type RequestJSONs = {
    [k in keyof typeof requestValidators]: InferOutput<typeof requestValidators[k]>
};