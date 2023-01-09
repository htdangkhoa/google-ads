import { grpc } from 'google-gax';
import { JWT, JWTOptions } from 'google-auth-library';

export const getCredentials = () => {
  const authClient = new JWT({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    subject: process.env.GOOGLE_USER_EMAIL,
    scopes: ['https://www.googleapis.com/auth/adwords'],
  });

  const ssl = grpc.credentials.createSsl();

  const callCredentials =
    grpc.credentials.createFromGoogleCredential(authClient);

  const credentials = grpc.credentials.combineChannelCredentials(
    ssl,
    callCredentials,
  );

  return credentials;
};
