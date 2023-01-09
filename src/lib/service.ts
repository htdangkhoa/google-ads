import { getCredentials } from './auth';
import { AllServices, CustomerOptions, ServiceName } from './types';

export interface IService {
  get callHeaders(): Record<string, string>;
}

export class Service implements IService {
  // @ts-expect-error All fields don't need to be set here
  private cachedClients: Record<ServiceName, AllServices> = {};

  public developerToken: string;

  constructor(developerToken: string) {
    this.developerToken = developerToken;
  }

  get callHeaders(): Record<string, string> {
    throw new Error('Method not implemented.');
  }

  loadService<T = AllServices>(serviceName: ServiceName): T {
    if (this.cachedClients[serviceName])
      return this.cachedClients[serviceName] as T;

    const { [serviceName]: ProtoService } = require('google-ads-node');

    const credentials = getCredentials();

    const client = new ProtoService({
      sslCreds: credentials,
    });

    this.cachedClients[serviceName] = client;

    return client;
  }
}
