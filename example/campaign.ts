import { google } from 'googleapis';

import { GoogleAds } from '../src/lib';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

export function getCampaigns(customer_id: string, login_customer_id: string) {
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

  return service.search({
    query: `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.start_date,
        campaign.end_date,
        campaign.serving_status,
        campaign.resource_name
      FROM campaign
    `,
  });
}
