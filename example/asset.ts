import { google } from 'googleapis';
import { Asset } from '../src/generated/google/ads/googleads/v12/resources/asset';
import { AssetOperation } from '../src/generated/google/ads/googleads/v12/services/asset_service';
import { MutateOperation } from '../src/generated/google/ads/googleads/v12/services/google_ads_service';

import { GoogleAds } from '../src/lib';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export async function uploadAsset(
  customer_id: string,
  login_customer_id: string,
  assets: Asset[],
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

  const mutate_operations: MutateOperation[] = assets.map((asset) => ({
    operation: {
      assetOperation: {
        create: asset,
      },
    },
  }));

  try {
    const {
      response: {
        mutateOperationResponses: mutate_operation_responses,
        partialFailureError: partial_failure_error,
      },
    } = await service.mutate({
      mutateOperations: [
        {
          operation: {
            oneofKind: 'assetOperation',
            assetOperation: {
              operation: {
                oneofKind: 'create',
                create: assets[0],
              },
            },
          },
        },
      ],
    });
    console.log(mutate_operation_responses);
    console.log(partial_failure_error);
  } catch (error) {
    console.log(error);
  }
}
