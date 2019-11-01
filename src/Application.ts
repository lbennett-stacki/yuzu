import { Middleware } from 'koa';
import logger from 'koa-logger';
import { Class } from './types/Class';
import { Server } from './Server';
import { Router } from './Router';
import { DatabaseI, DatabaseConfigI } from './database/Database';
import { ModelI } from './model/Model';
import { Session, SessionConfigI } from './Session';
import {
  Authenticator,
  AuthMiddleware,
  AuthenticateOptionsI,
} from './Authenticator';

export interface ApplicationI {
  boot(): void;
  registerRouter(router: Class<Router>, routes: Function): void;
  registerDatabase(configResolver: Function): void;
  registerSession(configResolver: Function): void;
  model(name: string): void;
}

export interface ApplicationConfigI {
  server: Server;
  router?: Router;
  database?: DatabaseI;
  session?: Session;
  auth?: Authenticator;
  errorHandler?: Middleware;
  hasLogger?: boolean;
}

export class Application implements ApplicationI {
  private server: Server;
  private router: Router;
  private database: DatabaseI;
  private session: Session;
  private auth: Authenticator;
  private errorHandler: Middleware;
  private hasLogger: boolean;

  constructor(config: ApplicationConfigI) {
    this.server = config.server;
    this.router = config.router;
    this.database = config.database;
    this.session = config.session;
    this.auth = config.auth;
    this.errorHandler = config.errorHandler;
    this.hasLogger = config.hasLogger === undefined ? true : config.hasLogger;
  }

  boot(): void {
    if (this.database) this.database.init();

    const middlewares: Middleware[] = [];

    if (this.session) middlewares.push(this.session.middleware(this.server));

    if (this.hasLogger) middlewares.push(logger());

    if (this.auth)
      middlewares.push(
        this.auth.middleware({ session: Boolean(this.session) })
      );

    middlewares.push(this.router.middleware());

    if (this.errorHandler) middlewares.unshift(this.errorHandler);

    this.server.init(middlewares);
  }

  registerRouter(router: Class<Router>, routes: Function): void {
    this.router = new router(this);
    routes(this.router);
  }

  registerDatabase(configResolver: Function): void {
    const config: DatabaseConfigI = configResolver();

    this.database = new config.adapter(config.client, config.connectionString);
    config.models(this.database);
  }

  registerSession(configResolver: Function): void {
    const config: SessionConfigI = configResolver();

    if (!config.session) return;

    this.session = new config.session(config);
  }

  registerAuth(authenticatorResolver: Function): void {
    this.auth = authenticatorResolver(this);
  }

  registerErrorHandler(errorHandler: Middleware): void {
    this.errorHandler = errorHandler;
  }

  model(name: string): ModelI {
    return this.database.model(name);
  }

  authenticate(options: AuthenticateOptionsI | string): AuthMiddleware {
    let newOptions = options;
    if (typeof options !== 'string') {
      newOptions = {
        ...options,
        session:
          options.session === undefined
            ? Boolean(this.session)
            : options.session,
      };
    }

    return this.auth.authenticate(newOptions);
  }

  isAuthenticated(): Middleware {
    return this.auth.isAuthenticated();
  }
}
