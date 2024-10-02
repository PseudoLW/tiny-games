import { useId, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import type { RequestJSONs } from "../common/requests";
import type { ResponseJSONs } from "../common/responses";

export type CreateOrJoinRoomProps = {
    onConfirm(roomName: string, roomId: string, players: string[]): void;
    onCancel(): void;
};
type Part<T extends Record<string, unknown>> = { [k in keyof T]?: T[k] | undefined };

const CreateOrJoinRoom = <Req, Res extends { success: boolean; }>(
    fetchURL: string,
    roomLabel: string,
    header: string,
    submitMessage: string,
    requestDataParser: (roomData: string, player: string) => Req,
    roomDataGetter: (body: Res & { success: true; }, roomFormData: string) => [string, string],
    errorGetter: (body: Res & { success: false; }) => Part<{ room: string, player: string; }>,
    playerDataGetter: (body: Res & { success: true; }, playerFormData: string) => string[]
) =>
    ({ onConfirm, onCancel }: CreateOrJoinRoomProps) => {
        const eidPlayerName = useId();
        const eidRom = useId();

        const [isFetching, setFetching] = useState(false);
        const [errors, setErrors] = useState<Part<{ room: string; player: string; global: string; }>>({});

        const onSubmit = async (ev: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
            ev.preventDefault();
            const data = new FormData(ev.target as HTMLFormElement);
            const playerData = data.get('player-name')?.toString() ?? '';
            const roomData = data.get('room')?.toString() ?? '';
            setFetching(true);
            try {
                const data: Req = requestDataParser(roomData, playerData);
                const res = await fetch(fetchURL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const body = await res.json() as Res;
                if (body.success) {
                    const [roomName, roomId] = roomDataGetter(body as Res & { success: true; }, roomData);
                    onConfirm(
                        roomName, roomId,
                        playerDataGetter(body as Res & { success: true; }, playerData));
                } else {
                    setFetching(false);
                    setErrors(errorGetter(body as Res & { success: false; }));
                }
            } catch {
                setErrors({ global: 'Unknown error occurred.' });
            }
        };
        return <>
            <h2>{header}</h2>
            <form onSubmit={(ev) => onSubmit(ev)}>
                <InputGroup
                    id={eidPlayerName}
                    name="player-name"
                    error={errors.player}
                    label='Your player name'
                    disabled={isFetching} />
                <InputGroup
                    id={eidRom}
                    name="room"
                    error={errors.room}
                    label={roomLabel}
                    disabled={isFetching} />
                {errors.global !== undefined && <span>{errors.global}</span>}
                <button type="submit" disabled={isFetching}>{submitMessage}</button>
                <button onClick={onCancel} type="button" disabled={isFetching}>Back</button>
            </form>
        </>;
    };

const InputGroup = (prop: {
    id: string;
    name: string;
    error: string | undefined;
    label: string;
    disabled: boolean;
}) => {
    const { id, name, error, label, disabled } = prop;
    return <div>
        {error !== undefined && <span>{error}</span>}
        <label htmlFor={id}>{label}</label>
        <input type="text" name={name} id={id} disabled={disabled} />
    </div>;
};

export const CreateRoom = CreateOrJoinRoom<RequestJSONs['/createRoom'], ResponseJSONs['/createRoom']>(
    '/createRoom', 'New room name', 'Create a room!', 'Create a new room!',
    (roomData, player) => ({ hostName: player, roomName: roomData }),
    (body, formData) => ([formData, body.roomId]),
    ({ roomError, hostError }) => ({ room: roomError ?? undefined, player: hostError ?? undefined }),
    (_, playerName) => ([playerName])
);

export const JoinRoom = CreateOrJoinRoom<RequestJSONs['/joinRoom'], ResponseJSONs['/joinRoom']>(
    '/joinRoom', 'Room ID', 'Join a room!', 'Join a room!',
    (roomData, player) => ({ playerName: player, roomId: roomData }),
    (_, roomFormData) => (roomFormData.split('#') as [string, string]),
    ({ roomError, playerError }) => ({ room: roomError ?? undefined, player: playerError ?? undefined }),
    (body) => (body.currentPlayers)
);
