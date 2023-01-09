import { CustomerServiceClient } from 'google-ads-node';
import { Service } from './service';

export class Customer extends Service {
  get callHeaders(): Record<string, string> {
    const headers = {
      'developer-token': this.developerToken,
    };

    return headers;
  }

  async listAccessibleCustomers() {
    const client: CustomerServiceClient = this.loadService(
      'CustomerServiceClient',
    );

    const [response] = await client.listAccessibleCustomers(
      {},
      {
        otherArgs: {
          headers: this.callHeaders,
        },
      },
    );

    return response;
  }
}
