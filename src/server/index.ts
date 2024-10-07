const port = 8001, hostname = 'localhost', secure = false;
import { compileAsync } from "sass";
import { LobbyMessageToClient } from "../common/websocket/lobby";
import { buildRepositories, tokenBank } from "./repositories";
import { RouteFunction } from "./routes/$type";
import { createRoom } from "./routes/create-room";
import { joinRoom } from "./routes/join-room";
import { createPlayerRepository } from "./repositories/playerRepository";
function main() {
    console.log(`Running at http${secure ? 's' : ''}://${hostname}:${port}/`);

    const clientGlobalVar: typeof clientGlobal = {
        websocketUrl: `ws${secure ? 's' : ''}://${hostname}:${port}/ws`,
    };

    const repositories = buildRepositories();
    const websocketTokenBank = tokenBank();
    const repo = createPlayerRepository();

    const routes: Record<string, RouteFunction> = {
        '/createRoom': createRoom(repositories.Room, repositories.Player, websocketTokenBank, repo),
        '/joinRoom': joinRoom(repositories.Room, repositories.Player, websocketTokenBank, repo),


        // Websocket
        '/ws'(req, server) {
            if (server.upgrade(req, {
                data: { token: new URL(req.url).searchParams.get("id") }
            })) {
                return 'ws';
            }
            return new Response("Upgrade failed", { status: 500 });
        },


        // Statics
        ''() {
            return new Response(Bun.file('./resource/index.html'));
        },
        async '/script.js'() {
            const buildResult = (await Bun.build({ entrypoints: ['./src/client/index.tsx'] })).outputs[0];
            if (!buildResult) {
                return new Response("Can't compile Typescript", { status: 500 });
            }
            return new Response(new Blob([`const clientGlobal = ${JSON.stringify(clientGlobalVar)}`, buildResult]));
        },
        async '/style.css'() {
            try {
                const x = await compileAsync('./src/styles/main.sass');
                const file = new Blob([x.css], { type: 'text/css' });
                return new Response(file);
            } catch {
                return new Response("Can't compile Sass", { status: 500 });
            }
        }
    };

    const server = Bun.serve<{ token: string; }>({
        port, hostname,
        async fetch(req, server) {
            const pathname = new URL(req.url).pathname;
            const trimmedPathname = pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname;
            const response = await routes[trimmedPathname]?.(req, server);
            if (response === 'ws') {
                return undefined;
            } else if (response) {
                return response;
            }

            return new Response('Not found!', { status: 404 });
        },
        websocket: {
            open(ws) {
                const conn = websocketTokenBank.get(ws.data.token);
                ws.subscribe(conn.room);
                console.log(`Subscribing ${ws.data.token} to ${conn.room}`);
                server.publish(conn.room, JSON.stringify({
                    type: 'player-update',
                    players: repositories.Room.get(conn.room).playerNames.map(s => ({ name: s, ready: true }))
                } satisfies LobbyMessageToClient));
                console.log(`Published to ${conn.room}`);
            },
            message() { }
        }
    });
}
main();