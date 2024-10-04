export const WebsocketHandler = <
    Out extends { type: string; },
    In extends { type: string; }
>(
    token: number,
    initialData: Out & { type: 'init'; },
) => {
    const url = new URL(`${clientGlobal.websocketUrl}`);
    url.searchParams.append('id', token.toString(16).padStart(12, '0'));
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => {
        ws.send(JSON.stringify(initialData));
    });
    return {
        close() {
            ws.close();
        }
    };
};