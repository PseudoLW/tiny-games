export const WebsocketHandler = <
    Out extends { type: string; },
    In extends { type: string; }
>(
    token: string,
    onMessage: ((data: In, send: (data: Out) => void) => void)
) => {
    const url = new URL(`${clientGlobal.websocketUrl}`);
    url.searchParams.append('id', token);
    const ws = new WebSocket(url);
    ws.addEventListener('message', (e) => {
        const inData = JSON.parse(e.data);
        onMessage(
            inData, (outData) => ws.send(JSON.stringify(outData)));
    });
    return {
        close() {
            ws.close();
        }
    };
};