import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';

import { ServiceProvider } from './ServiceProvider';
import { AllServices, ServiceName, ServiceOptions } from './types';
import { getCredentials } from './utils';

export class Service extends ServiceProvider {
  // @ts-expect-error All fields don't need to be set here
  private cachedClients: Record<ServiceName, AllServices> = {};

  protected options: ServiceOptions;

  constructor(options: ServiceOptions) {
    super();

    this.options = options;
  }

  protected get callMetadata(): RpcMetadata {
    throw new Error('Not implemented');
  }

  protected loadService<T = AllServices>(serviceName: ServiceName): T {
    if (this.cachedClients[serviceName])
      return this.cachedClients[serviceName] as T;

    const { [serviceName]: ProtoService } = require('../generated/google');

    const credentials = getCredentials(this.options.auth);

    const transport = new GrpcTransport({
      host: 'googleads.googleapis.com',
      channelCredentials: credentials,
    });

    const client = new ProtoService(transport);

    this.cachedClients[serviceName] = client;

    return client;
  }
}
