import { Strategy } from 'passport';
import koaPassport from 'koa-passport';
import { Middleware, Context } from 'koa';
import koaCompose from 'koa-compose';
import { Class } from './types/Class';
import { Application } from './Application';
import { deprecationMessage } from './Deprecation';

export type AuthMiddleware = Middleware;
export type VerifyFunction = (request, options?: object) => Promise<void>;

export interface AuthenticateOptionsI {
  name: string;
  session?: boolean;
  scope?: string[];
  failureRedirect?: string;
}

export interface AuthenticateMiddlewareOptionsI {
  session?: boolean;
}

export class Authenticator {
  private auth: typeof koaPassport;
  private application: Application;

  constructor(application) {
    this.auth = koaPassport;
    this.application = application;
  }

  addProvider(
    name: string,
    strategy: Class<Strategy>,
    config?: object,
    verify?: Function
  ): void {
    this.auth.use(
      name,
      new strategy(config, (...args): void => verify(this.application, ...args))
    );

    this.auth.serializeUser(function(user, done) {
      done(null, user);
    });

    this.auth.deserializeUser(function(user, done) {
      done(null, user);
    });
  }

  authenticate(options: AuthenticateOptionsI | string): AuthMiddleware {
    let name, config;
    if (typeof options === 'string') {
      deprecationMessage(
        '`authenticate` route option of type string is deprecated, please use an object with key `name` instead'
      );
      name = options;
      config = {};
    } else {
      name = options.name;
      config = options;
    }

    return this.auth.authenticate(name, config);
  }

  isAuthenticated(): Middleware {
    return (context: Context, next: Function): void => {
      if (context.isAuthenticated()) {
        return next();
      } else {
        context.status = 401;
      }
    };
  }

  middleware(config: AuthenticateMiddlewareOptionsI = {}): Middleware {
    const middleware = [this.auth.initialize()];
    if (config.session) middleware.push(koaPassport.session());

    return koaCompose(middleware);
  }
}
