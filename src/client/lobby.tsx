export type WaitingListProps = {
    lobbyData: {
        playerList: string[];
        roomId: string;
        roomName: string;
    };
};

export const Lobby = ({lobbyData: { playerList, roomName, roomId }}: WaitingListProps) => {
    return <>
        <h3>Welcome to {roomName}#{roomId}</h3>
        <h4>Players:</h4>
        <ul>
            {playerList.map(playerName => <li>{playerName}</li>)}
        </ul>
    </>;
};