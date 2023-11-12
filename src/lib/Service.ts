import { Metadata } from '@grpc/grpc-js';

import { ServiceProvider } from './ServiceProvider';
import { AllServices, ServiceName, ServiceOptions } from './types';
import { getCredentials } from './utils';
import { LoggingInterceptor } from './LoggingInterceptor';
import { HOST } from './constants';

export class Service extends ServiceProvider {
  // @ts-expect-error All fields don't need to be set here
  protected cachedClients: Record<ServiceName, AllServices> = {};

  protected options: ServiceOptions;

  constructor(options: ServiceOptions) {
    super();

    this.options = options;
  }

  protected get callMetadata(): Metadata {
    throw new Error('Not implemented');
  }

  protected loadService<T = AllServices>(serviceName: ServiceName): T {
    if (this.cachedClients[serviceName])
      return this.cachedClients[serviceName] as T;

    const { [serviceName]: ProtoService } = require('../generated/google');

    const credentials = getCredentials(this.options.auth);

    const client = new ProtoService(HOST, credentials, {
      interceptors: [
        new LoggingInterceptor(this.options.logging || false).interceptCall,
      ],
    });

    this.cachedClients[serviceName] = client;

    return client;
  }
}
