import { Metadata } from '@grpc/grpc-js';
import { all as mergeAll } from 'deepmerge';

import { Service } from './Service';
import { CustomerOptions, ServiceOptions, OptionalExceptFor } from './types';
import { GoogleAdsServiceClient } from '../generated/google';
import {
  SearchGoogleAdsRequest,
  SearchGoogleAdsResponse,
  SearchGoogleAdsStreamRequest,
  SearchGoogleAdsStreamResponse,
  MutateGoogleAdsRequest,
  MutateGoogleAdsResponse,
} from '../generated/google/ads/googleads/v12/services/google_ads_service';
import { decodeGoogleAdsFailureBuffer } from './utils';

export class GoogleAds extends Service {
  private customerOptions: CustomerOptions;

  constructor(options: ServiceOptions, customer: CustomerOptions) {
    super(options);

    this.customerOptions = customer;
  }

  protected get callMetadata(): Metadata {
    const meta = new Metadata();

    meta.set('developer-token', this.options.developer_token);

    if (this.customerOptions.login_customer_id) {
      meta.set('login-customer-id', this.customerOptions.login_customer_id);
    }

    if (this.customerOptions.linked_customer_id) {
      meta.set('linked-customer-id', this.customerOptions.linked_customer_id);
    }

    return meta;
  }

  private transformRequest<R = any>(
    request: any,
    metadata?: Metadata,
  ): [R, Metadata] {
    const req = <R>(
      mergeAll([{ customer_id: this.customerOptions.customer_id }, request])
    );

    const meta = this.callMetadata;
    if (metadata) {
      meta.merge(metadata);
    }

    return [req, meta];
  }

  search(request: SearchGoogleAdsRequest, metadata?: Metadata) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, meta] = this.transformRequest<SearchGoogleAdsRequest>(
      request,
      metadata,
    );

    return new Promise<SearchGoogleAdsResponse>((resolve, reject) =>
      client.search(req, meta, (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }),
    );
  }

  async *searchStream(
    request: SearchGoogleAdsStreamRequest,
    metadata?: Metadata,
  ): AsyncGenerator<SearchGoogleAdsStreamResponse, void, unknown> {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, meta] = this.transformRequest<SearchGoogleAdsStreamRequest>(
      request,
      metadata,
    );

    const responses = client.searchStream(req, meta);

    for await (const response of responses) {
      yield response;
    }
  }

  mutate(request: MutateGoogleAdsRequest, metadata?: Metadata) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, meta] = this.transformRequest<MutateGoogleAdsRequest>(
      request,
      metadata,
    );

    return new Promise<MutateGoogleAdsResponse>((resolve, reject) =>
      client.mutate(req, meta, (error, response) => {
        if (error) {
          return reject(error);
        }

        if (!response.partial_failure_error) return resolve(response);

        const unit8Array = response.partial_failure_error.details?.find?.(
          (detail) => detail.type_url?.includes('errors.GoogleAdsFailure'),
        )?.value;

        if (!unit8Array || !unit8Array.length) return resolve(response);

        const buffer = Buffer.from(unit8Array);

        const partialFailureError = decodeGoogleAdsFailureBuffer(buffer);

        const result = <MutateGoogleAdsResponse>(
          mergeAll([response, { partial_failure_error: partialFailureError }])
        );

        return resolve(result);
      }),
    );
  }
}
