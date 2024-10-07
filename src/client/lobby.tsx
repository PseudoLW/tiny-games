import { useEffect, useState } from "preact/hooks";
import { LobbyMessageToClient, LobbyMessageToServer } from "../common/websocket/lobby";
import { WebsocketHandler } from "./effect/websocket";

export type LobbyProps = {
    lobbyData: {
        player: string;
        playerList: { name: string; ready: boolean; }[];
        roomId: string;
        roomName: string;
        websocketToken: string;
    };
};

export const Lobby = ({ lobbyData: { websocketToken, playerList: playerListProp, roomName, roomId, player } }: LobbyProps) => {
    const [playerList, setPlayerList] = useState(playerListProp);
    useEffect(() => {
        const ws = WebsocketHandler<LobbyMessageToServer, LobbyMessageToClient>(
            websocketToken,
            (data) => {
                if (data.type === 'player-update') {
                    setPlayerList(data.players);
                }
            }
        );

        return () => {
            ws.close();
        };
    }, []);
    return <>
        <h3>Welcome to {roomName}#{roomId}, {player}!</h3>
        <h4>Players:</h4>
        <ul>
            {playerList.map(playerName => <li>{playerName.name}</li>)}
        </ul>
    </>;
};