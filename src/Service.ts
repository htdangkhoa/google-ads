import { Metadata } from '@grpc/grpc-js';

import { ServiceProvider } from './ServiceProvider.js';
import { ServiceOptions } from './types.js';
import { getCredentials } from './utils.js';
import { LoggingInterceptor } from './LoggingInterceptor.js';
import { HOST, VERSION } from './constants.js';
import { google } from './generated/index.js';

type ClassOfService = new (...args: any[]) => any;

export class Service extends ServiceProvider {
  // // @ts-expect-error All fields don't need to be set here
  protected cachedClients: Record<string, ClassOfService> = {};

  protected options: ServiceOptions;

  constructor(options: ServiceOptions) {
    super();

    this.options = options;
  }

  protected get callMetadata(): Metadata {
    throw new Error('Not implemented');
  }

  protected loadService<T = ClassOfService>(serviceName: string): T {
    if (this.cachedClients[serviceName])
      return this.cachedClients[serviceName] as T;

    const ProtoService = google.ads.googleads[VERSION].services[serviceName];

    if (!ProtoService) {
      throw new Error(`Service ${serviceName} not found.`);
    }

    const {
      auth,
      developer_token,
      logging,
      interceptors = [],
      ...opts
    } = this.options;
    const credentials = getCredentials(auth);

    const client = new ProtoService(HOST, credentials, {
      ...opts,
      interceptors: [
        new LoggingInterceptor(logging || false).interceptCall,
        ...interceptors,
      ],
    });

    this.cachedClients[serviceName] = client;

    return client;
  }
}
