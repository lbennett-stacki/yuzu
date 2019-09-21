import { Middleware } from 'koa';
import koaCompose from 'koa-compose';
import { Class, Member } from './types/Class';
import {
  Route,
  RouteConfigInterface,
  RouteBeforeAfterMiddleware,
} from './Route';
import KoaRouter from 'koa-router';
import { Application } from './Application';
import { Controller } from './Controller';

class RouterRouter extends KoaRouter {
  [index: string]: Member;
}

export interface RouterInterface {
  routes: Route[];
  controllers: Map<Class<Controller>, Controller>;
  routerMiddleware: RouterRouter;

  post(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void;
  get(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void;
  put(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void;

  middleware(): Middleware;
}

export class Router implements RouterInterface {
  routes: Route[] = [];
  controllers: Map<Class<Controller>, Controller> = new Map();
  routerMiddleware: RouterRouter;
  private application: Application;

  constructor(application: Application) {
    this.application = application;
  }

  post(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void {
    this.register('post', endpoint, controller, action || 'create', config);
  }

  get(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void {
    this.register('get', endpoint, controller, action || 'index', config);
  }

  put(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigInterface
  ): void {
    this.register('put', endpoint, controller, action || 'edit', config);
  }

  private register(
    method: 'get' | 'post' | 'put',
    endpoint: string,
    controller: Class<Controller>,
    action: string,
    config: RouteConfigInterface = {}
  ): void {
    const controllerInstance = this.registerController(controller);

    this.routes.push(
      new Route(
        this.application,
        method,
        endpoint,
        controllerInstance,
        action,
        config
      )
    );
  }

  private registerController(controller: Class<Controller>): Controller {
    if (this.controllers.has(controller)) {
      return this.controllers.get(controller);
    } else {
      const controllerInstance = new controller(this.application);

      this.controllers.set(controller, controllerInstance);

      return controllerInstance;
    }
  }

  middleware(): Middleware {
    this.routerMiddleware = new RouterRouter();

    this.buildMiddlewareRoutes();

    return koaCompose([
      this.routerMiddleware.routes(),
      this.routerMiddleware.routes(),
    ]);
  }

  private buildMiddlewareRoutes(): void {
    this.routes.forEach((route: Route) => {
      const middleware: RouteBeforeAfterMiddleware = route.middleware();

      this.routerMiddleware[route.method](
        route.endpoint,
        ...middleware.before,
        route.controllerAction,
        ...middleware.after
      );
    });
  }
}
