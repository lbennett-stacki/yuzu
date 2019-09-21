import { Middleware } from 'koa';
import { Class } from './types/Class';
import { Server } from './Server';
import { Router } from './Router';
import {
  DatabaseInterface,
  DatabaseConfigInterface,
} from './database/Database';
import { ModelInterface } from './model/Model';
import { Session, SessionConfigInterface } from './Session';
import {
  Authenticator,
  AuthMiddleware,
  AuthenticateOptionsI,
} from './Authenticator';

export interface ApplicationInterface {
  boot(): void;
  registerRouter(router: Class<Router>, routes: Function): void;
  registerDatabase(configResolver: Function): void;
  registerSession(configResolver: Function): void;
  model(name: string): void;
}

export interface ApplicationConfigInterface {
  server: Server;
  router?: Router;
  database?: DatabaseInterface;
  session?: Session;
  auth?: Authenticator;
}

export class Application implements ApplicationInterface {
  private server: Server;
  private router: Router;
  private database: DatabaseInterface;
  private session: Session;
  private auth: Authenticator;

  constructor(config: ApplicationConfigInterface) {
    this.server = config.server;
    this.router = config.router;
    this.database = config.database;
    this.session = config.session;
    this.auth = config.auth;
  }

  boot(): void {
    if (this.database) this.database.init();

    const middlewares: Middleware[] = [];
    if (this.session) middlewares.push(this.session.middleware(this.server));
    middlewares.push(
      this.auth.middleware({ session: Boolean(this.session) }),
      this.router.middleware()
    );
    this.server.init(middlewares);
  }

  registerRouter(router: Class<Router>, routes: Function): void {
    this.router = new router(this);
    routes(this.router);
  }

  registerDatabase(configResolver: Function): void {
    const config: DatabaseConfigInterface = configResolver();

    this.database = new config.adapter(config.client, config.connectionString);
    config.models(this.database);
  }

  registerSession(configResolver: Function): void {
    const config: SessionConfigInterface = configResolver();

    if (!config.session) return;

    this.session = new config.session(config);
  }

  registerAuth(authenticatorResolver: Function): void {
    this.auth = authenticatorResolver(this);
  }

  model(name: string): ModelInterface {
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
