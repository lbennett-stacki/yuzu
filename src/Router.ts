import { Middleware } from 'koa';
import koaCompose from 'koa-compose';
import { Class, Member } from './types/Class';
import { Route, RouteConfigI, RouteBeforeAfterMiddleware } from './Route';
import KoaRouter from 'koa-router';
import { Application } from './Application';
import { Controller } from './Controller';

class RouterRouter extends KoaRouter {
  [index: string]: Member;
}

export interface NestedRouterMiddlewareI {
  middleware: Middleware[];
  router: RouterI;
}

export interface RouterI {
  routes: Route[];
  controllers: Map<Class<Controller>, Controller>;
  routerMiddleware: RouterRouter;
  ns: string;

  post(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void;
  get(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void;
  put(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void;

  namespace(name: string, block: Function): void;

  middleware(): Middleware;
}

export class Router implements RouterI {
  routes: Route[] = [];
  nsRouters: Router[] = [];
  controllers: Map<Class<Controller>, Controller> = new Map();
  routerMiddleware: RouterRouter;
  private application: Application;
  ns: string;
  config: RouteConfigI;

  constructor(application: Application, ns?: string, config?: RouteConfigI) {
    this.application = application;
    this.ns = ns;
    this.config = config;
  }

  post(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void {
    this.register('post', endpoint, controller, action || 'create', config);
  }

  get(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void {
    this.register('get', endpoint, controller, action || 'index', config);
  }

  put(
    endpoint: string,
    controller: Class<Controller>,
    action?: string,
    config?: RouteConfigI
  ): void {
    this.register('put', endpoint, controller, action || 'edit', config);
  }

  namespace(name: string, block: Function, config?: RouteConfigI): void {
    const router = new Router(this.application, name, config);
    block(router);
    this.nsRouters.push(router);
  }

  private register(
    method: 'get' | 'post' | 'put',
    endpoint: string,
    controller: Class<Controller>,
    action: string,
    config: RouteConfigI = {}
  ): void {
    const controllerInstance = this.registerController(controller);

    this.routes.push(
      new Route(
        this.application,
        method,
        endpoint,
        controllerInstance,
        action,
        Object.assign({}, this.config, config)
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
    return koaCompose(this.buildMiddleware());
  }

  buildMiddleware(): Middleware[] {
    this.routerMiddleware = new RouterRouter();

    const nested = this.buildMiddlewareRoutes();

    nested.forEach((middleware: NestedRouterMiddlewareI) => {
      this.routerMiddleware.use(middleware.router.ns, ...middleware.middleware);
    });

    return [
      this.routerMiddleware.routes(),
      this.routerMiddleware.allowedMethods(),
    ];
  }

  private buildMiddlewareRoutes(): NestedRouterMiddlewareI[] {
    this.routes.forEach((route: Route) => {
      const middleware: RouteBeforeAfterMiddleware = route.middleware();

      this.routerMiddleware[route.method](
        route.endpoint,
        ...middleware.before,
        route.controllerAction,
        ...middleware.after
      );
    });

    return this.nsRouters.map((router: Router) => {
      return { middleware: router.buildMiddleware(), router };
    });
  }
}
