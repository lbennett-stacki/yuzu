import { Strategy } from 'passport';
import koaPassport from 'koa-passport';
import { Middleware, Context } from 'koa';
import koaCompose from 'koa-compose';
import { Class } from './types/Class';
import { Application } from './Application';

export type AuthMiddleware = Middleware;
export type VerifyFunction = (request, options?: object) => Promise<void>;

export interface AuthenticateOptionsI {
  session?: boolean;
  name: string;
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

  authenticate(
    name: string,
    config?: AuthenticateOptionsI,
    verify?: VerifyFunction
  ): AuthMiddleware {
    return this.auth.authenticate(name, config, verify);
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
