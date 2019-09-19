import koaSession from 'koa-session';
import { Middleware } from 'koa';
import { Server } from './Server';
import { Class } from './types/Class';

export interface SessionCookieConfigInterface {
  signingSecrets: string[];
  key: string;
  maxAge: number | 'session';
}

export interface SessionConfigInterface {
  cookie?: SessionCookieConfigInterface;
  session?: Class<Session>;
}

export class Session {
  private sessionMiddleware: Middleware;
  private config: SessionConfigInterface;

  constructor(config: SessionConfigInterface) {
    this.config = config;
  }

  middleware(server: Server): Middleware {
    server.setSigningSecrets(this.config.cookie.signingSecrets);

    this.sessionMiddleware = koaSession(
      {
        key: this.config.cookie.key,
        maxAge: this.config.cookie.maxAge,
      },
      server.getServer()
    );

    return this.sessionMiddleware;
  }
}
