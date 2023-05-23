import { google } from 'googleapis';

import { GoogleAds } from '../src/lib';
import { AdGroupStatusEnum_AdGroupStatus } from '../src/generated/google/ads/googleads/v13/enums/ad_group_status';
import { AdGroupTypeEnum_AdGroupType } from '../src/generated/google/ads/googleads/v13/enums/ad_group_type';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export async function createAdGroup(
  customer_id: string,
  login_customer_id: string,
  name: string,
  campaign_resource: string,
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
        ad_group_operation: {
          create: {
            name,
            status: AdGroupStatusEnum_AdGroupStatus.PAUSED,
            campaign: campaign_resource,
            type: AdGroupTypeEnum_AdGroupType.SEARCH_STANDARD,
          },
        },
      },
    ],
  });
}
