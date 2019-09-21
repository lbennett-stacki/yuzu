import { Controller } from './Controller';
import { Application } from './Application';
import { AuthenticateOptionsI } from './Authenticator';
import { deprecationMessage } from './Deprecation';

export interface RouteConfigInterface {
  authenticate?: string | AuthenticateOptionsI;
  authenticated?: boolean;
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
    const { authenticate } = this.config;

    if (authenticate) {
      let name, config;
      if (typeof authenticate === 'string') {
        deprecationMessage(
          '`authenticate` route option of type string is deprecated, please use an object with key `name` instead'
        );
        name = authenticate;
        config = {};
      } else {
        name = authenticate.name;
        config = authenticate;
      }

      before.unshift(this.application.authenticate(name, config));
    }

    return {
      before,
      after,
    };
  }
}
