import { Metadata, CallProperties } from '@grpc/grpc-js';

import { ServiceProvider } from './ServiceProvider.js';
import { ServiceOptions } from './types.js';
import { getCredentials } from './utils.js';
import { LoggingInterceptor } from './LoggingInterceptor.js';
import { HOST, VERSION } from './constants.js';
import { google } from './generated/index.js';

type ClassOfService = new (...args: any[]) => any;

export class Service extends ServiceProvider {
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
      callInvocationTransformer,
      ...opts
    } = this.options;
    const credentials = getCredentials(auth);

    const logger = new LoggingInterceptor(logging || false);

    const client = new ProtoService(HOST, credentials, {
      ...opts,
      interceptors: [logger.interceptCall.bind(logger), ...interceptors],
      callInvocationTransformer: (properties: CallProperties<any, any>) => {
        return logger.callInvocationTransformer(
          properties,
          callInvocationTransformer,
        );
      },
    });

    this.cachedClients[serviceName] = client;

    return client;
  }
}
