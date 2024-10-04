import { Server } from "bun";

export type RouteFunction = (req: Request, server: Server) => Response | Promise<Response> | 'ws';