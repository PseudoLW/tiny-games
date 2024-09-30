const port = 8001, hostname = 'localhost', secure = false;
console.log(`Running at http${secure ? 's' : ''}://${hostname}:${port}/`);

const routes: Record<string, () => (Response | PromiseLike<Response>)> = {
    '/': () => new Response(Bun.file('./resource/index.html')),
    '/script.js': async () => new Response(
        (await Bun.build({ entrypoints: ['./src/client/index.tsx'] })).outputs[0]),
    '/api': () => Response.json({ message: 'Hello from the server!' })
};

Bun.serve({
    port, hostname,
    async fetch(req) {
        const url = new URL(req.url);
        const response = await routes[url.pathname]?.();
        if (response) return response;

        return new Response('Not found!', { status: 404 });
    }
});