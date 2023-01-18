import { GoogleAdsServiceClient } from '../generated/google';
import { CallOptions } from 'google-gax';
import { mergeDeepRight } from 'ramda';

import { Service } from './Service';
import { CustomerOptions, ServiceOptions } from './types';
import { getGoogleAdsError } from './utils';

export class GoogleAds extends Service {
  private customerOptions: CustomerOptions;

  constructor(options: ServiceOptions, customer: CustomerOptions) {
    super(options);

    this.customerOptions = customer;
  }

  protected get callHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'developer-token': this.options.developer_token,
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
    const req = mergeDeepRight(
      {
        customer_id: this.customerOptions.customer_id,
      },
      request,
    );

    const opts = mergeDeepRight(
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

    const [response] = await client.search(...data).catch((error) => {
      throw getGoogleAdsError(error);
    });

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

    try {
      for await (const response of stream) {
        yield response;
      }
    } catch (error: any) {
      throw getGoogleAdsError(error as unknown as Error);
    }
  }

  async mutate(
    request: protos.google.ads.googleads.v12.services.IMutateGoogleAdsRequest = {},
    options: CallOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const data = this.transformRequest(request, options);

    const [response] = await client.mutate(...data).catch((error) => {
      throw getGoogleAdsError(error);
    });

    return response;
  }
}
