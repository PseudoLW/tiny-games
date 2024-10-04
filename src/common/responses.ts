export type ResponseJSONs = {
    '/createRoom':
    { success: true; roomId: string; currentPlayers: string[]; websocketToken: number; } |
    { success: false; roomError: string | null; hostError: string | null; };
    '/joinRoom':
    { success: true; currentPlayers: string[]; websocketToken: number; } |
    { success: false; roomError: string | null; playerError: string | null; };
};
