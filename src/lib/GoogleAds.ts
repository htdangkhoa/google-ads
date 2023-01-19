import { GoogleAdsServiceClient } from '../generated/google';
import { RpcOptions, RpcMetadata } from '@protobuf-ts/runtime-rpc';
import { all as mergeAll } from 'deepmerge';

import { Service } from './Service';
import { CustomerOptions, ServiceOptions, OptionalExceptFor } from './types';
import {
  SearchGoogleAdsRequest,
  SearchGoogleAdsStreamRequest,
  MutateGoogleAdsRequest,
} from '../generated/google/ads/googleads/v12/services/google_ads_service';
import { SummaryRowSettingEnum_SummaryRowSetting } from '../generated/google/ads/googleads/v12/enums/summary_row_setting';
import { ResponseContentTypeEnum_ResponseContentType } from '../generated/google/ads/googleads/v12/enums/response_content_type';

export class GoogleAds extends Service {
  private customerOptions: CustomerOptions;

  constructor(options: ServiceOptions, customer: CustomerOptions) {
    super(options);

    this.customerOptions = customer;
  }

  protected get callMetadata(): RpcMetadata {
    const meta: RpcMetadata = {};

    meta['developer-token'] = this.options.developer_token;

    if (this.customerOptions?.login_customer_id) {
      meta['login-customer-id'] = this.customerOptions.login_customer_id;
    }

    if (this.customerOptions?.linked_customer_id) {
      meta['linked-customer-id'] = this.customerOptions.linked_customer_id;
    }

    return meta;
  }

  private transformRequest<R = any>(
    request: any,
    options: RpcOptions = {},
  ): [R, RpcOptions] {
    const req = <R>(
      mergeAll([{ customerId: this.customerOptions.customer_id }, request])
    );

    const opts = <RpcOptions>mergeAll([
      {
        meta: this.callMetadata,
      },
      options,
    ]);

    return [req, opts];
  }

  search(
    request: OptionalExceptFor<SearchGoogleAdsRequest, 'query'>,
    options: RpcOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, opts] = this.transformRequest<SearchGoogleAdsRequest>(
      request,
      options,
    );

    const finalReq = <SearchGoogleAdsRequest>mergeAll([
      req,
      {
        query: req.query,
        returnTotalResultsCount: req.returnTotalResultsCount || false,
        validateOnly: req.validateOnly || false,
        summaryRowSetting:
          req.summaryRowSetting ||
          SummaryRowSettingEnum_SummaryRowSetting.NO_SUMMARY_ROW,
        pageToken: req.pageToken || '',
        pageSize: req.pageSize || 10000,
      },
    ]);

    return client.search(finalReq, opts);
  }

  async *searchStream(
    request: OptionalExceptFor<SearchGoogleAdsStreamRequest, 'query'>,
    options: RpcOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, opts] = this.transformRequest(request, options);

    const finalReq = <SearchGoogleAdsStreamRequest>mergeAll([
      req,
      {
        query: req.query,
        summaryRowSetting:
          req.summaryRowSetting ||
          SummaryRowSettingEnum_SummaryRowSetting.NO_SUMMARY_ROW,
      },
    ]);

    const { responses } = client.searchStream(finalReq, opts);

    for await (const response of responses) {
      yield response;
    }
  }

  mutate(
    request: OptionalExceptFor<MutateGoogleAdsRequest, 'mutateOperations'>,
    options: RpcOptions = {},
  ) {
    const client: GoogleAdsServiceClient = this.loadService(
      'GoogleAdsServiceClient',
    );

    const [req, opts] = this.transformRequest<MutateGoogleAdsRequest>(
      request,
      options,
    );

    const finalReq = <MutateGoogleAdsRequest>mergeAll([
      req,
      {
        mutateOperations: req.mutateOperations,
        partialFailure: req.partialFailure || false,
        validateOnly: req.validateOnly || false,
        responseContentType:
          req.responseContentType ||
          ResponseContentTypeEnum_ResponseContentType.MUTABLE_RESOURCE,
      },
    ]);

    return client.mutate(finalReq, opts);
  }
}
