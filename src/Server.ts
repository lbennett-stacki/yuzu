import Koa, { Context as KoaContext, Middleware } from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaCORS from '@koa/cors';
import koaCompose from 'koa-compose';

export type Context = KoaContext;

export interface ServerInterface {
  server: Koa;
  port: number;

  listen(): void;
  use(middleware: Middleware): Server;
}

export class Server {
  server: Koa;
  private readonly port: number = 4433;

  constructor() {
    this.server = new Koa();
  }

  init(middlewares: Middleware[]): void {
    this.registerDefaultMiddleware(middlewares);
    this.listen();
  }

  private registerDefaultMiddleware(middlewares: Middleware[]): void {
    this.use(koaBodyParser());
    this.use(koaCORS());

    this.use(middlewares);
  }

  listen(): void {
    this.server.listen(this.port);
    console.info(`Listening on port ${this.port}...`);
  }

  use(middleware: Middleware | Middleware[]): Server {
    const middlewares: Middleware[] = Array.isArray(middleware)
      ? middleware
      : [middleware];

    this.server.use(koaCompose(middlewares));

    return this;
  }

  setSigningSecrets(secrets: string[]): void {
    this.server.keys = secrets;
  }

  // TODO: look to remove
  getServer(): Koa {
    return this.server;
  }
}