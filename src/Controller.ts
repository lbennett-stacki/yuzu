import { Context } from './Server';
import { Application } from './Application';
import { ModelInterface } from './model/Model';
import { Member } from './types/Class';
import { AuthMiddleware, AuthenticateOptionsI } from './Authenticator';

export interface ControllerInterface {
  [index: string]: Member;

  before: Function[];
  after: Function[];
  index(context: Context): Promise<Context>;
  show(context: Context): Promise<Context>;
  create(context: Context): Promise<Context>;
  edit(context: Context): Promise<Context>;
  destroy(context: Context): Promise<Context>;
}

export class Controller implements ControllerInterface {
  [index: string]: Member;

  private application: Application;
  before: Function[] = [];
  after: Function[] = [];

  constructor(application: Application) {
    this.application = application;
  }

  async index(context: Context): Promise<Context> {
    return context;
  }

  async show(context: Context): Promise<Context> {
    return context;
  }

  async create(context: Context): Promise<Context> {
    return context;
  }

  async edit(context: Context): Promise<Context> {
    return context;
  }

  async destroy(context: Context): Promise<Context> {
    return context;
  }

  protected model(name: string): ModelInterface {
    return this.application.model(name);
  }

  protected authenticate(
    options: AuthenticateOptionsI | string
  ): AuthMiddleware {
    return this.application.authenticate(options);
  }
}
