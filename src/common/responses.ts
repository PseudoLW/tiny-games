export type ResponseChoice<Success, Failure> =
    (Success & { success: true; }) |
    (Failure & { success: false; });

export type RoomJoinResponse = {
    success: true;
    playerName: string;
    roomIdNumber: string;
    roomName: string;
    currentPlayers: { name: string; ready: boolean; }[];
    websocketToken: string;
};
export type RoomJoinError = {
    roomError: string | null;
    playerError: string | null;
};
export type ResponseJSONs = {
    '/createRoom': ResponseChoice<RoomJoinResponse, RoomJoinError>;
    '/joinRoom': ResponseChoice<RoomJoinResponse, RoomJoinError>;
};
