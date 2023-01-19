import { Metadata } from '@grpc/grpc-js';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';
import { CustomerServiceClient } from '../generated/google';
import { Service } from './Service';

export class Customer extends Service {
  protected get callMetadata(): RpcMetadata {
    const meta: RpcMetadata = {};

    meta['developer-token'] = this.options.developer_token;

    return meta;
  }

  listAccessibleCustomers() {
    const client: CustomerServiceClient = this.loadService(
      'CustomerServiceClient',
    );

    return client.listAccessibleCustomers(
      {},
      {
        meta: this.callMetadata,
      },
    );
  }
}
