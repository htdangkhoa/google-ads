import { google } from 'googleapis';
import { Customer, GoogleAds, QueryBuilder } from '../src';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: process.env.GOOGLE_ADS_EMAIL,
  scopes: ['https://www.googleapis.com/auth/adwords'],
});

const developer_token = process.env.DEVELOPER_TOKEN!;

async function main() {
  const service = new Customer({
    auth: authClient,
    developer_token,
  });

  const { resource_names: customers } = await service.listAccessibleCustomers();

  const customer_id = customers![0].replace('customers/', '');
  console.log('customer_id:', customer_id);

  const googleAdsService = new GoogleAds(
    {
      auth: authClient,
      developer_token,
    },
    {
      customer_id,
    },
  );

  const { results: customerClients } = await googleAdsService.search({
    query: new QueryBuilder()
      .select(
        'customer_client.resource_name',
        'customer_client.client_customer',
        'customer_client.level',
        'customer_client.hidden',
      )
      .from('customer_client')
      .build(),
  });

  const customer_client = customerClients!
    .find(
      (it) => it.customer_client?.client_customer === 'customers/1797830005',
    )!
    .customer_client!.client_customer!.replace('customers/', '');
  console.log('customer_client:', customer_client);

  const stream = googleAdsService
    .setCustomerId(customer_client)
    .setLoginCustomerId(customer_id)
    .searchStream({
      query: `
      SELECT
        asset.name,
        -- IMAGE
        asset.image_asset.file_size,
        asset.image_asset.full_size.height_pixels,
        asset.image_asset.full_size.url,
        asset.image_asset.full_size.width_pixels,
        asset.image_asset.mime_type,
        -- VIDEO
        asset.youtube_video_asset.youtube_video_id,
        asset.youtube_video_asset.youtube_video_title
      FROM asset
    `,
    });
  for await (const response of stream) {
    console.log('adGroups:', response.results);
  }
}

main();
