import { CustomerServiceClient } from 'google-ads-node';
import { Service } from './Service';
import { getGoogleAdsError } from './utils';

export class Customer extends Service {
  protected get callHeaders(): Record<string, string> {
    const headers = {
      'developer-token': this.options.developer_token,
    };

    return headers;
  }

  async listAccessibleCustomers() {
    const client: CustomerServiceClient = this.loadService(
      'CustomerServiceClient',
    );

    const [response] = await client
      .listAccessibleCustomers(
        {},
        {
          otherArgs: {
            headers: this.callHeaders,
          },
        },
      )
      .catch((error) => {
        throw getGoogleAdsError(error);
      });

    return response;
  }
}
