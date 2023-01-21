import { Metadata } from '@grpc/grpc-js';

import { Service } from './Service';
import { CustomerServiceClient } from '../generated/google';
import { ListAccessibleCustomersResponse } from '../generated/google/ads/googleads/v12/services/customer_service';

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

    return new Promise<ListAccessibleCustomersResponse>((resolve, reject) =>
      client.listAccessibleCustomers(
        {},
        this.callMetadata,
        (error, response) => {
          if (error) {
            return reject(error);
          }

          return resolve(response);
        },
      ),
    );
  }
}
