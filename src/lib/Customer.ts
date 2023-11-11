import { promisify } from 'util';
import { Metadata } from '@grpc/grpc-js';

import { Service } from './Service';
import { CustomerServiceClient } from '../generated/google';
import {
  ListAccessibleCustomersRequest,
  ListAccessibleCustomersResponse,
} from '../generated/google/ads/googleads/v14/services/customer_service';

export class Customer extends Service {
  protected get callMetadata(): Metadata {
    const meta = new Metadata();
    meta.set('developer-token', this.options.developer_token);

    return meta;
  }

  listAccessibleCustomers() {
    const client: CustomerServiceClient = this.loadService(
      'CustomerServiceClient',
    );

    const fn = client.listAccessibleCustomers.bind(client);

    const caller = promisify<
      ListAccessibleCustomersRequest,
      Metadata,
      ListAccessibleCustomersResponse
    >(fn);

    return caller({}, this.callMetadata);
  }
}
