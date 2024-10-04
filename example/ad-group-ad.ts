import { google } from 'googleapis';

import { GoogleAds, ads, MessageType } from '../src';

const {
  common: { AdTextAsset },
  enums: { AdGroupAdStatusEnum_AdGroupAdStatus },
} = ads.googleads.v17;

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export async function createAdGroupAdApp(
  customer_id: string,
  login_customer_id: string,
  ad_group_resource: string,
  headlines: MessageType<typeof AdTextAsset>[],
  descriptions: MessageType<typeof AdTextAsset>[],
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

  return service.mutate({
    mutate_operations: [
      {
        ad_group_ad_operation: {
          create: {
            ad_group: ad_group_resource,
            ad: {
              app_ad: {
                headlines,
                descriptions,
                images: [
                  {
                    asset: 'customers/1797830005/assets/16650021565',
                  },
                ],
                youtube_videos: [
                  {
                    asset: 'customers/1797830005/assets/16650021565',
                  },
                ],
              },
            },
            status: AdGroupAdStatusEnum_AdGroupAdStatus.PAUSED,
          },
        },
      },
    ],
  });
}
