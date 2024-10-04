import { google } from 'googleapis';

import { GoogleAds, ads, MessageType } from '../src';

const {
  resources: { Asset },
  services: { MutateOperation },
} = ads.googleads.v17;

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export async function uploadAsset(
  customer_id: string,
  login_customer_id: string,
  assets: MessageType<typeof Asset>[],
) {
  const service = new GoogleAds(
    {
      auth: authClient,
      developer_token: process.env.DEVELOPER_TOKEN!,
    },
    {
      customer_id,
      login_customer_id,
    },
  );

  const mutate_operations: MessageType<typeof MutateOperation>[] = assets.map(
    (asset) => ({
      asset_operation: {
        create: asset,
      },
    }),
  );

  try {
    const { mutate_operation_responses, partial_failure_error } =
      await service.mutate({
        mutate_operations,
      });
    console.log(mutate_operation_responses);
    console.log(partial_failure_error);
  } catch (error) {
    console.log(error);
  }
}
