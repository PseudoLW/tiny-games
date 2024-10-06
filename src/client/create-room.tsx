import { useId, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import type { RequestJSONs } from "../common/requests";
import type { ResponseChoice, RoomJoinError, RoomJoinResponse } from "../common/responses";
import type { LobbyProps } from "./lobby";

export type CreateOrJoinRoomProps = {
    onConfirm(lobbyData: LobbyProps['lobbyData']): void;
    onCancel(): void;
};
type Part<T extends Record<string, unknown>> = { [k in keyof T]?: T[k] | undefined };

const CreateOrJoinRoom = <Req,>(
    fetchURL: string,
    roomLabel: string,
    header: string,
    submitMessage: string,
    requestDataParser: (roomData: string, player: string) => Req,
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
                const body = await res.json() as ResponseChoice<RoomJoinResponse, RoomJoinError>;
                if (body.success) {
                    onConfirm({
                        player: body.playerName,
                        playerList: body.currentPlayers,
                        roomId: body.roomIdNumber,
                        roomName: body.roomName,
                        websocketToken: body.websocketToken
                    });
                } else {
                    setFetching(false);
                    setErrors({
                        room: body.roomError ?? undefined,
                        player: body.playerError ?? undefined
                    });
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

export const CreateRoom = CreateOrJoinRoom<RequestJSONs['/createRoom']>(
    '/createRoom', 'New room name', 'Create a room!', 'Create a new room!',
    (roomData, player) => ({ hostName: player, roomName: roomData })
);

export const JoinRoom = CreateOrJoinRoom<RequestJSONs['/joinRoom']>(
    '/joinRoom', 'Room ID', 'Join a room!', 'Join a room!',
    (roomData, player) => ({ playerName: player, roomId: roomData })
);
