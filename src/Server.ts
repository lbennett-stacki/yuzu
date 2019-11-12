import Koa, { Context as KoaContext, Middleware } from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaCORS from '@koa/cors';
import koaCompose from 'koa-compose';

export { KoaContext as Context };

export interface ServerI {
  server: Koa;
  port: number;

  listen(): void;
  use(middleware: Middleware): Server;
}

export interface ServerConfigI {
  port?: number;
}

export class Server {
  server: Koa;
  private readonly port: number = 4433;

  constructor(config: ServerConfigI = {}) {
    this.server = new Koa();
    if (config.port) this.port = config.port;
  }

  init(middlewares: Middleware[]): void {
    this.registerDefaultMiddleware(middlewares);
    this.listen();
  }

  private registerDefaultMiddleware(middlewares: Middleware[]): void {
    this.use(koaBodyParser());
    this.use(koaCORS({ credentials: true })); // TODO: config-able

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
