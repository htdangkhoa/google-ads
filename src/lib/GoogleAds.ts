import { GoogleAdsServiceClient, protos } from 'google-ads-node';
import { CallOptions } from 'google-gax';
import R from 'ramda';

import { Service } from './service';
import { CustomerOptions } from './types';

export class GoogleAds extends Service {
  private customerOptions: CustomerOptions;

  constructor(developerToken: string, customer: CustomerOptions) {
    super(developerToken);

    this.customerOptions = customer;
  }

  get callHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'developer-token': this.developerToken,
    };

    if (this.customerOptions?.login_customer_id) {
      headers['login-customer-id'] = this.customerOptions.login_customer_id;
    }

    if (this.customerOptions?.linked_customer_id) {
      headers['linked-customer-id'] = this.customerOptions.linked_customer_id;
    }

    return headers;
  }

  private transformRequest(request: any, options: CallOptions = {}) {
    const req = R.mergeDeepWith(
      R.concat,
      {
        customer_id: this.customerOptions.customer_id,
      },
      request,
    );

    const opts = R.mergeDeepWith(
      R.concat,
      {
        otherArgs: {
          headers: this.callHeaders,
        },
      },
      options,
    );

    return [req, opts];
  }

  async search(
    request: protos.google.ads.googleads.v12.services.ISearchGoogleAdsRequest = {},
    options: CallOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const data = this.transformRequest(request, options);

    const [response] = await client.search(...data);

    return response;
  }

  async *searchStream(
    request: protos.google.ads.googleads.v12.services.ISearchGoogleAdsStreamRequest = {},
    options: CallOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const data = this.transformRequest(request, options);

    const stream = client.searchStream(...data);

    for await (const response of stream) {
      yield response;
    }
  }
}
