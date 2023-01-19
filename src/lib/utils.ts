import { credentials, OAuth2Client } from '@grpc/grpc-js';

export const getCredentials = (authClient: OAuth2Client) => {
  const ssl = credentials.createSsl();

  const callCredentials = credentials.createFromGoogleCredential(authClient);

  const channelCredentials = credentials.combineChannelCredentials(
    ssl,
    callCredentials,
  );

  return channelCredentials;
};
