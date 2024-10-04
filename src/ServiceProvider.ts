import { Metadata } from '@grpc/grpc-js';

export abstract class ServiceProvider {
  protected abstract get callMetadata(): Metadata;
}
