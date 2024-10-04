import { useEffect } from "preact/hooks";
import { LobbyMessageToClient, LobbyMessageToServer } from "../common/websocket/lobby";
import { WebsocketHandler } from "./effect/websocket";

export type WaitingListProps = {
    lobbyData: {
        player: string;
        playerList: string[];
        roomId: string;
        roomName: string;
        websocketToken: number;
    };
};

export const Lobby = ({ lobbyData: { websocketToken, playerList, roomName, roomId, player } }: WaitingListProps) => {
    useEffect(() => {
        const ws = WebsocketHandler<LobbyMessageToServer, LobbyMessageToClient>(
            websocketToken,
            { type: 'init', id: `${player}@${roomId}` },
        );

        return () => {
            ws.close();
        };
    });
    return <>
        <h3>Welcome to {roomName}#{roomId}, {player}!</h3>
        <h4>Players:</h4>
        <ul>
            {playerList.map(playerName => <li>{playerName}</li>)}
        </ul>
    </>;
};