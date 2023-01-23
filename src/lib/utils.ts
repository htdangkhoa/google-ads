import { credentials, OAuth2Client } from '@grpc/grpc-js';
import { GoogleAdsFailure } from '../generated/google/ads/googleads/v12/errors/errors';
import { FAILURE_KEY } from './constants';

export const getCredentials = (authClient: OAuth2Client) => {
  const ssl = credentials.createSsl();

  const callCredentials = credentials.createFromGoogleCredential(authClient);

  const channelCredentials = credentials.combineChannelCredentials(
    ssl,
    callCredentials,
  );

  return channelCredentials;
};

export const decodeGoogleAdsFailureBuffer = (buffer: Buffer) =>
  GoogleAdsFailure.decode(buffer);

export const getGoogleAdsError = (error: Error): GoogleAdsFailure | Error => {
  // @ts-expect-error
  if (typeof error.metadata?.internalRepr?.get?.(FAILURE_KEY) === 'undefined') {
    return error;
  }

  // @ts-expect-error
  const [buffer] = error.metadata.internalRepr.get(FAILURE_KEY);

  return decodeGoogleAdsFailureBuffer(buffer);
};
