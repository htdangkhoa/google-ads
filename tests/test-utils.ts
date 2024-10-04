import { credentials, Metadata, ServiceError } from '@grpc/grpc-js';
import { google } from 'googleapis';

import { Customer, GoogleAds, MessageType, Service, ads } from '../src';

const {
  services: {
    ListAccessibleCustomersResponse,
    GoogleAdsRow,
    MutateGoogleAdsRequest,
    MutateGoogleAdsResponse,
    MutateOperation,
    MutateOperationResponse,
    SearchGoogleAdsRequest,
    SearchGoogleAdsResponse,
    SearchGoogleAdsStreamRequest,
    SearchGoogleAdsStreamResponse,
  },
  enums: { AdGroupStatusEnum_AdGroupStatus, AdGroupTypeEnum_AdGroupType },
} = ads.googleads.v17;

type AllServices = new (...args: any[]) => any;

export const MOCK_ADDRESS = 'googleads.googleapis.com';

export const MOCK_CREDENTIALS = credentials.createInsecure();

export const MOCK_OAUTH2_CLIENT = new google.auth.JWT({
  keyFile: 'MOCK KEY FILE',
  subject: 'MOCK SUBJECT',
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export const MOCK_DEVELOPER_TOKEN = 'MOCK DEVELOPER TOKEN';

export const MOCK_MANAGER_ID = 'MOCK MANAGER ID';

export const MOCK_CUSTOMER_ID = 'MOCK CUSTOMER ID';

export const MOCK_LINKED_CUSTOMER_ID = 'MOCK LINKED CUSTOMER ID';

export const MOCK_CUSTOMERS = ['customers/1234567890'];

export const MOCK_CUSTOMER_CLIENTS: MessageType<typeof GoogleAdsRow>[] = [
  {
    customer_client: {
      resource_name: `customers/${MOCK_MANAGER_ID}/customerClients/${MOCK_CUSTOMER_ID}`,
      client_customer: MOCK_CUSTOMER_ID,
      level: '1',
      hidden: false,
    },
  },
];

export const MOCK_CAMPAIGNS: MessageType<typeof GoogleAdsRow>[] = [
  { campaign: { resource_name: 'customers/1/campaigns/11' } },
  { campaign: { resource_name: 'customers/2/campaigns/22' } },
  { campaign: { resource_name: 'customers/3/campaigns/33' } },
];

export const MOCK_AD_GROUP_OPERATIONS: MessageType<typeof MutateOperation>[] = [
  {
    ad_group_operation: {
      create: {
        name: 'Ad Group 1',
        status: AdGroupStatusEnum_AdGroupStatus.PAUSED,
        type: AdGroupTypeEnum_AdGroupType.SEARCH_STANDARD,
        campaign: 'customers/1234567890/campaigns/1234567890',
      },
    },
  },
];

export const MOCK_AD_GROUP_RESULTS: MessageType<
  typeof MutateOperationResponse
>[] = [
  {
    ad_group_result: {
      resource_name: 'customers/1/adGroups/11',
    },
  },
];

export class MockService extends Service {
  loadService<T = AllServices>(serviceName: string): T {
    return super.loadService(serviceName);
  }

  getCachedClient<T = AllServices>(serviceName: string): T {
    return this.cachedClients[serviceName] as T;
  }

  getCallMetadata() {
    return this.callMetadata;
  }
}

export class MockCustomer extends Customer {
  async mockListAccessibleCustomers(): Promise<
    MessageType<typeof ListAccessibleCustomersResponse>
  > {
    try {
      return await super.listAccessibleCustomers();
    } catch (err: any) {
    } finally {
      return {
        resource_names: MOCK_CUSTOMERS,
      };
    }
  }
}

export class MockGoogleAds extends GoogleAds {
  async mockSearch(
    request: MessageType<typeof SearchGoogleAdsRequest>,
    mockResponse: MessageType<typeof SearchGoogleAdsResponse> | ServiceError,
    metadata?: Metadata | undefined,
  ): Promise<MessageType<typeof SearchGoogleAdsResponse> | ServiceError> {
    try {
      return await super.search(request, metadata);
    } catch (err: any) {
      if (err.message === 'Missing customer ID') throw err;
    } finally {
      if ('results' in mockResponse) {
        return mockResponse as MessageType<typeof SearchGoogleAdsResponse>;
      } else {
        throw mockResponse as ServiceError;
      }
    }
  }

  async *mockSearchStream(
    request: MessageType<typeof SearchGoogleAdsStreamRequest>,
    mockResponse: MessageType<typeof SearchGoogleAdsStreamResponse>,
    metadata?: Metadata | undefined,
  ): AsyncGenerator<
    MessageType<typeof SearchGoogleAdsStreamResponse>,
    any,
    unknown
  > {
    const stream = super.searchStream(request, metadata);

    try {
      for await (const response of stream) {
        yield response;
      }
    } catch (err: any) {
    } finally {
      for await (const item of [mockResponse]) {
        yield item;
      }
    }
  }

  async mockMutate(
    request: MessageType<typeof MutateGoogleAdsRequest>,
    mockResponse: MessageType<typeof MutateGoogleAdsResponse>,
    metadata?: Metadata | undefined,
  ): Promise<MessageType<typeof MutateGoogleAdsResponse>> {
    try {
      return await super.mutate(request, metadata);
    } catch (err: any) {
      if (err.message === 'Missing customer ID') throw err;
    } finally {
      return mockResponse;
    }
  }
}
