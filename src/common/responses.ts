export type ResponseJSONs = {
    '/createRoom':
    { success: true; roomId: string; currentPlayers: { name: string; ready: boolean; }[]; websocketToken: string; } |
    { success: false; roomError: string | null; hostError: string | null; };

    '/joinRoom':
    { success: true; currentPlayers: { name: string; ready: boolean; }[]; websocketToken: string; } |
    { success: false; roomError: string | null; playerError: string | null; };
};
