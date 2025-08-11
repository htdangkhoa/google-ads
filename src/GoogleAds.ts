import { promisify } from 'util';
import { ClientReadableStream, Metadata } from '@grpc/grpc-js';
import deepmerge from 'deepmerge';

import {
  GoogleAdsServiceClient,
  SearchGoogleAdsRequest,
  SearchGoogleAdsResponse,
  SearchGoogleAdsStreamRequest,
  SearchGoogleAdsStreamResponse,
  MutateGoogleAdsRequest,
  MutateGoogleAdsResponse,
} from './generated/google/ads/googleads/v21/services/google_ads_service.js';
import { Service } from './Service.js';
import { CustomerOptions, ServiceOptions } from './types.js';

export class GoogleAds extends Service {
  private customerOptions: CustomerOptions;

  constructor(options: ServiceOptions, customer: CustomerOptions = {}) {
    super(options);

    this.customerOptions = customer;
  }

  setCustomerId(customerId: string) {
    this.customerOptions.customer_id = customerId;
    return this;
  }

  setLoginCustomerId(loginCustomerId: string) {
    this.customerOptions.login_customer_id = loginCustomerId;
    return this;
  }

  setLinkedCustomerId(linkedCustomerId: string) {
    this.customerOptions.linked_customer_id = linkedCustomerId;
    return this;
  }

  protected get callMetadata(): Metadata {
    const meta = new Metadata();

    meta.set('developer-token', this.options.developer_token);

    if (!this.customerOptions.customer_id)
      throw new Error('Missing customer ID');

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
      deepmerge.all([
        { customer_id: this.customerOptions.customer_id },
        request,
      ])
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

    const fn = client.search.bind(client);

    const caller = promisify<
      SearchGoogleAdsRequest,
      Metadata,
      SearchGoogleAdsResponse
    >(fn);

    return caller(req, meta);
  }

  searchStream(
    request: SearchGoogleAdsStreamRequest,
    metadata?: Metadata,
  ): ClientReadableStream<SearchGoogleAdsStreamResponse> {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, meta] = this.transformRequest<SearchGoogleAdsStreamRequest>(
      request,
      metadata,
    );

    return client.searchStream(req, meta);
  }

  mutate(request: MutateGoogleAdsRequest, metadata?: Metadata) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, meta] = this.transformRequest<MutateGoogleAdsRequest>(
      request,
      metadata,
    );

    const fn = client.mutate.bind(client);

    const caller = promisify<
      MutateGoogleAdsRequest,
      Metadata,
      MutateGoogleAdsResponse
    >(fn);

    return caller(req, meta);
  }
}
