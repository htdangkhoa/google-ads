import { JWT } from 'google-auth-library';

import { GoogleAds, QueryBuilder } from '../src';

const authClient = new JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export function getCampaigns(customer_id: string, login_customer_id: string) {
  const service = new GoogleAds(
    {
      auth: authClient as any,
      developer_token: process.env.DEVELOPER_TOKEN!,
    },
    {
      customer_id,
      login_customer_id,
    },
  );

  const query = new QueryBuilder()
    .select(
      'campaign.id',
      'campaign.name',
      'campaign.status',
      'campaign.start_date',
      'campaign.end_date',
      'campaign.serving_status',
      'campaign.resource_name',
    )
    .from('campaign')
    .build();

  return service.search({ query });
}
