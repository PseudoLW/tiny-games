const port = 8001, hostname = 'localhost', secure = false;
import { buildRepositories } from "./repositories";
import { RouteFunction } from "./routes/$type";
import { createRoom } from "./routes/create-room";
import { joinRoom } from "./routes/join-room";

function main() {
    console.log(`Running at http${secure ? 's' : ''}://${hostname}:${port}/`);

    const repositories = buildRepositories();

    const routes: Record<string, RouteFunction> = {
        '/createRoom': createRoom(repositories.Room, repositories.Player),
        '/joinRoom': joinRoom(repositories.Room, repositories.Player),

        // Statics
        '': () => new Response(Bun.file('./resource/index.html')),
        '/script.js': async () => new Response(
            (await Bun.build({ entrypoints: ['./src/client/index.tsx'] })).outputs[0]),
    };

    Bun.serve({
        port, hostname,
        async fetch(req) {
            const pathname = new URL(req.url).pathname;
            const trimmedPathname = pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname;
            const response = await routes[trimmedPathname]?.(req);
            if (response) return response;

            return new Response('Not found!', { status: 404 });
        }
    });
}
main();