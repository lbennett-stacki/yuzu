import { Controller } from './Controller';
import { Application } from './Application';
import { AuthenticateOptionsI } from './Authenticator';

export interface RouteConfigInterface {
  authenticate?: string | AuthenticateOptionsI;
  isAuthenticated?: boolean;
}

export interface RouteInterface {
  readonly method: string;
  readonly endpoint: string;
  readonly controller: Controller;
  readonly action: string;
  readonly config?: RouteConfigInterface;
}

export interface RouteBeforeAfterMiddleware {
  before: Function[];
  after: Function[];
}

export class Route implements RouteInterface {
  readonly method: string;
  readonly endpoint: string;
  readonly controller: Controller;
  readonly action: string;
  readonly config: RouteConfigInterface = {};
  readonly controllerAction: Function;
  private application: Application;

  constructor(
    application: Application,
    method: string,
    endpoint: string,
    controller: Controller,
    action: string,
    config: RouteConfigInterface = {}
  ) {
    this.application = application;
    this.method = method;
    this.endpoint = endpoint;
    this.controller = controller;
    this.action = action;
    this.config = config;
    this.controllerAction = this.controller[this.action].bind(this.controller);
  }

  middleware(): RouteBeforeAfterMiddleware {
    const before = this.controller.before.map(middleware =>
      middleware.bind(this.controller)
    );
    const after = this.controller.after.map(middleware =>
      middleware.bind(this.controller)
    );

    const { authenticate, isAuthenticated } = this.config;

    if (isAuthenticated) {
      before.unshift(this.application.isAuthenticated());
    }

    if (authenticate) {
      before.unshift(this.application.authenticate(authenticate));
    }

    return {
      before,
      after,
    };
  }
}
