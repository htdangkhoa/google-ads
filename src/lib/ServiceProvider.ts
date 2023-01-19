import { RpcMetadata } from '@protobuf-ts/runtime-rpc';

export abstract class ServiceProvider {
  protected abstract get callMetadata(): RpcMetadata;
}
