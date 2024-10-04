import { render } from "preact";
import { useState } from 'preact/hooks';
import { CreateRoom, JoinRoom } from "./create-room";
import { Lobby, WaitingListProps } from "./lobby";

type AppStates = 'init' | 'create-room' | 'join-room' | 'joined';
const App = () => {
    const [state, setState] = useState<AppStates>('init');
    const [lobbyData, setLobbyData] = useState<WaitingListProps['lobbyData']>();
    const onFoundRoom = (roomName: string, roomId: string, player: string, playerList: string[], websocketToken: number) => {
        setLobbyData({ roomName, roomId, playerList, player, websocketToken });
        setState('joined');
    };
    if (state === 'init') {
        return <>
            <h1>Welcome to PLW's plaything!</h1>
            <button onClick={() => setState('create-room')}>Create a room</button>
            <button onClick={() => setState('join-room')}>Join a room</button>
        </>;
    } else if (state === 'create-room') {
        return <CreateRoom onConfirm={onFoundRoom} onCancel={() => setState('init')} />;
    } else if (state === 'join-room') {
        return <JoinRoom onConfirm={onFoundRoom} onCancel={() => setState('init')} />;
    } else if (state === 'joined') {
        return <Lobby lobbyData={lobbyData!} />;
    }
    return <></>;
};

render(<App />, document.body);