import {
  credentials,
  OAuth2Client,
  ServiceError,
  Metadata,
} from '@grpc/grpc-js';

import { GoogleAdsFailure } from './generated/google/ads/googleads/v22/errors/errors.js';
import { MutateGoogleAdsResponse } from './generated/google/ads/googleads/v22/services/google_ads_service.js';
import { FAILURE_KEY } from './constants.js';

export const getCredentials = (authClient: OAuth2Client) => {
  const ssl = credentials.createSsl();

  const callCredentials = credentials.createFromMetadataGenerator(
    ({ service_url }, callback) => {
      (authClient as any)
        .getRequestHeaders(service_url)
        .then((requestHeaders) => {
          const metadata = new Metadata();

          let headers = requestHeaders;

          if (globalThis.Headers || global.Headers) {
            const headerEntries = Object.fromEntries(headers);
            headers = Object.entries(headerEntries).reduce(
              (acc, [key, value]) => {
                acc[key] = value;
                return acc;
              },
              {} as Record<string, string>,
            );
          }

          Object.entries<string>(headers).forEach(([key, value]) => {
            metadata.set(key, value);
          });

          callback(null, metadata);
        })
        .catch((err) => callback(err));
    },
  );

  const channelCredentials = credentials.combineChannelCredentials(
    ssl,
    callCredentials,
  );

  return channelCredentials;
};

export const decodeGoogleAdsFailureBuffer = (buffer: Buffer) => {
  const input = new Uint8Array(buffer);

  return GoogleAdsFailure.decode(input);
};

export const getGoogleAdsError = (
  error: Error | ServiceError,
): GoogleAdsFailure | Error => {
  // @ts-expect-error
  if (typeof error.metadata?.internalRepr?.get?.(FAILURE_KEY) === 'undefined') {
    return error;
  }

  // @ts-expect-error
  const [buffer] = error.metadata.internalRepr.get(FAILURE_KEY);

  return decodeGoogleAdsFailureBuffer(buffer);
};

export const decodePartialFailureError = (
  response: MutateGoogleAdsResponse,
) => {
  if (!response.partial_failure_error) return response;

  const { details } = response.partial_failure_error;

  if (!details) return response;

  const { value } =
    details.find((detail) =>
      detail.type_url?.includes('errors.GoogleAdsFailure'),
    ) ?? {};

  if (!value) return response;

  const buffer = Buffer.from(value);

  return {
    ...response,
    partial_failure_error: decodeGoogleAdsFailureBuffer(buffer),
  };
};
