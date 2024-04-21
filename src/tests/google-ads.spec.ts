import { status, Metadata, ServiceError } from '@grpc/grpc-js';
import { AuthenticationErrorEnum_AuthenticationError } from '../generated/google/ads/googleads/v16/errors/authentication_error';
import {
  ErrorCode,
  GoogleAdsFailure,
} from '../generated/google/ads/googleads/v16/errors/errors';
import { RequestErrorEnum_RequestError } from '../generated/google/ads/googleads/v16/errors/request_error';
import { GoogleAdsRow } from '../generated/google/ads/googleads/v16/services/google_ads_service';
import { Status } from '../generated/google/rpc/status';
import { FAILURE_KEY, QueryBuilder, VERSION } from '../lib';
import { decodePartialFailureError, getGoogleAdsError } from '../lib/utils';
import {
  MockGoogleAds,
  MOCK_AD_GROUP_OPERATIONS,
  MOCK_AD_GROUP_RESULTS,
  MOCK_CAMPAIGNS,
  MOCK_CUSTOMER_CLIENTS,
  MOCK_CUSTOMER_ID,
  MOCK_DEVELOPER_TOKEN,
  MOCK_LINKED_CUSTOMER_ID,
  MOCK_MANAGER_ID,
  MOCK_OAUTH2_CLIENT,
} from './test-utils';

let service: MockGoogleAds;

beforeAll(async () => {
  service = new MockGoogleAds({
    auth: MOCK_OAUTH2_CLIENT,
    developer_token: MOCK_DEVELOPER_TOKEN,
  });
});

describe('search', () => {
  const query = new QueryBuilder()
    .select(
      'customer_client.resource_name',
      'customer_client.client_customer',
      'customer_client.level',
      'customer_client.hidden',
    )
    .from('customer_client')
    .build();

  it('should throw an error if missing customer ID', async () => {
    try {
      service.mockSearch({ query }, { results: MOCK_CUSTOMER_CLIENTS });
    } catch (err: any) {
      expect(err.message).toBe('Missing customer ID');
    }
  });

  it('should be able to search customer_client', async () => {
    const metadata = new Metadata();

    const { results } = await service
      .setCustomerId(MOCK_MANAGER_ID)
      .mockSearch({ query }, { results: MOCK_CUSTOMER_CLIENTS }, metadata);

    expect(results).toEqual(MOCK_CUSTOMER_CLIENTS);
  });

  it('should throw ServiceError', async () => {
    const internalRepr = new Map();
    internalRepr.set(FAILURE_KEY, [
      GoogleAdsFailure.fromPartial({
        errors: [
          {
            error_code: ErrorCode.fromPartial({
              authentication_error:
                AuthenticationErrorEnum_AuthenticationError.CUSTOMER_NOT_FOUND,
            }),
            message: 'No customer found for the provided customer id.',
          },
        ],
      }),
    ]);
    internalRepr.set('grpc-status-details-bin', [
      GoogleAdsFailure.fromPartial({
        errors: [
          {
            message:
              'Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.',
          },
        ],
      }),
    ]);

    const metadata = new Metadata();
    // @ts-expect-error
    metadata.internalRepr = internalRepr;

    const mockError = {
      code: status.UNAUTHENTICATED,
      details:
        'Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.',
      metadata,
    };

    try {
      await service
        .setCustomerId(MOCK_MANAGER_ID)
        .mockSearch({ query }, mockError as ServiceError);
    } catch (err: any) {
      const googleAdsError = getGoogleAdsError(err);

      await Promise.all([
        expect(err).toEqual(mockError),
        expect('errors' in googleAdsError).toBe(true),
      ]);
    }
  });

  it('should throw Error', async () => {
    const mockError = new Error('Something went wrong');

    try {
      await service
        .setCustomerId(MOCK_MANAGER_ID)
        .mockSearch({ query }, mockError as ServiceError);
    } catch (err: any) {
      const googleAdsError = getGoogleAdsError(err);

      await Promise.all([
        expect(err).toEqual(mockError),
        expect(googleAdsError).toEqual(mockError),
      ]);
    }
  });
});

describe('searchStream', () => {
  it('should be able to searchStream campaign', async () => {
    const query = new QueryBuilder()
      .select('campaign.id', 'campaign.name')
      .from('campaign')
      .build();

    const stream = service
      .setCustomerId(MOCK_MANAGER_ID)
      .setLinkedCustomerId(MOCK_LINKED_CUSTOMER_ID)
      .mockSearchStream({ query }, { results: MOCK_CAMPAIGNS });

    const campaigns: GoogleAdsRow[] = [];

    while (true) {
      const { value, done } = await stream.next();
      if (done) break;
      const results =
        value.results?.map?.((result: any) => result).filter(Boolean) ?? [];
      campaigns.push(...results);
    }

    expect(campaigns).toEqual(MOCK_CAMPAIGNS);
  });
});

describe('mutate', () => {
  it('should be able to mutate ad_group', async () => {
    const { mutate_operation_responses } = await service
      .setCustomerId(MOCK_CUSTOMER_ID)
      .setLoginCustomerId(MOCK_MANAGER_ID)
      .mockMutate(
        {
          mutate_operations: MOCK_AD_GROUP_OPERATIONS,
        },
        { mutate_operation_responses: MOCK_AD_GROUP_RESULTS },
      );

    expect(mutate_operation_responses).toEqual(MOCK_AD_GROUP_RESULTS);
  });

  describe('partial failure', () => {
    it('should decode partial failure errors if present on the response', async () => {
      const failureMessage = GoogleAdsFailure.fromPartial({
        errors: [
          {
            error_code: ErrorCode.fromPartial({
              request_error: RequestErrorEnum_RequestError.BAD_RESOURCE_ID,
            }),
            message: 'error message',
            location: {
              field_path_elements: [
                {
                  field_name: 'fake field',
                  index: 0,
                },
              ],
            },
          },
        ],
      });

      const failureBuffer = GoogleAdsFailure.encode(failureMessage).finish();

      const response = await service
        .setCustomerId(MOCK_CUSTOMER_ID)
        .setLoginCustomerId(MOCK_MANAGER_ID)
        .mockMutate(
          {
            mutate_operations: MOCK_AD_GROUP_OPERATIONS,
            partial_failure: true,
          },
          {
            mutate_operation_responses: [],
            partial_failure_error: Status.fromPartial({
              details: [
                {
                  type_url: `google.ads.googleads.${VERSION}.errors.GoogleAdsFailure`,
                  value: failureBuffer,
                },
              ],
            }),
          },
        );

      const { partial_failure_error } = response;

      expect(partial_failure_error?.details?.[0].value).toBe(failureBuffer);
    });

    describe('decode partial failure error', () => {
      it('should return original response if no partial failure error', async () => {
        const response = await service
          .setCustomerId(MOCK_CUSTOMER_ID)
          .setLoginCustomerId(MOCK_MANAGER_ID)
          .mockMutate(
            {
              mutate_operations: MOCK_AD_GROUP_OPERATIONS,
              partial_failure: false,
            },
            {
              mutate_operation_responses: MOCK_AD_GROUP_RESULTS,
            },
          );

        const parsedPartialFailureResponse =
          decodePartialFailureError(response);

        expect(parsedPartialFailureResponse).toEqual(response);
      });

      it('should return original response if no details', async () => {
        const response = await service
          .setCustomerId(MOCK_CUSTOMER_ID)
          .setLoginCustomerId(MOCK_MANAGER_ID)
          .mockMutate(
            {
              mutate_operations: MOCK_AD_GROUP_OPERATIONS,
              partial_failure: false,
            },
            {
              mutate_operation_responses: MOCK_AD_GROUP_RESULTS,
              partial_failure_error: {},
            },
          );

        const parsedPartialFailureResponse =
          decodePartialFailureError(response);

        expect(parsedPartialFailureResponse).toEqual(response);
      });

      it('should return original response if no value in details', async () => {
        const response = await service
          .setCustomerId(MOCK_CUSTOMER_ID)
          .setLoginCustomerId(MOCK_MANAGER_ID)
          .mockMutate(
            {
              mutate_operations: MOCK_AD_GROUP_OPERATIONS,
              partial_failure: false,
            },
            {
              mutate_operation_responses: MOCK_AD_GROUP_RESULTS,
              partial_failure_error: {
                details: [],
              },
            },
          );

        const parsedPartialFailureResponse =
          decodePartialFailureError(response);

        expect(parsedPartialFailureResponse).toEqual(response);
      });

      it('should return original response if no type_url in details', async () => {
        const response = await service
          .setCustomerId(MOCK_CUSTOMER_ID)
          .setLoginCustomerId(MOCK_MANAGER_ID)
          .mockMutate(
            {
              mutate_operations: MOCK_AD_GROUP_OPERATIONS,
              partial_failure: false,
            },
            {
              mutate_operation_responses: MOCK_AD_GROUP_RESULTS,
              partial_failure_error: {
                details: [
                  {
                    // @ts-expect-error
                    value: 'fake value',
                  },
                ],
              },
            },
          );

        const parsedPartialFailureResponse =
          decodePartialFailureError(response);

        expect(parsedPartialFailureResponse).toEqual(response);
      });

      it('should return the errors for partial failure', async () => {
        const failureMessage = GoogleAdsFailure.fromPartial({
          errors: [
            {
              error_code: ErrorCode.fromPartial({
                request_error: RequestErrorEnum_RequestError.BAD_RESOURCE_ID,
              }),
              message: 'error message',
              location: {
                field_path_elements: [
                  {
                    field_name: 'fake field',
                    index: 0,
                  },
                ],
              },
            },
          ],
        });

        const failureBuffer = GoogleAdsFailure.encode(failureMessage).finish();

        const response = await service
          .setCustomerId(MOCK_CUSTOMER_ID)
          .setLoginCustomerId(MOCK_MANAGER_ID)
          .mockMutate(
            {
              mutate_operations: MOCK_AD_GROUP_OPERATIONS,
              partial_failure: true,
            },
            {
              mutate_operation_responses: [],
              partial_failure_error: Status.fromPartial({
                details: [
                  {
                    type_url: `google.ads.googleads.${VERSION}.errors.GoogleAdsFailure`,
                    value: failureBuffer,
                  },
                ],
              }),
            },
          );

        const parsedPartialFailureResponse =
          decodePartialFailureError(response);

        expect(parsedPartialFailureResponse).toEqual({
          mutate_operation_responses: [],
          partial_failure_error: failureMessage,
        });
      });
    });
  });
});
