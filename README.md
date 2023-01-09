# Google Ads API Nodejs Client Library

## Usage

### Authentication

```ts
import { UserRefreshClient, JWT } from 'google-auth-library';

// for web application
const authClient = new UserRefreshClient({
  clientId: '<CLIENT_ID>',
  clientSecret: '<CLIENT_SECRET>',
  refreshToken: '<REFRESH_TOKEN>',
});

// or use JWT for service account
const authClient = new JWT({
  keyFile: '<KEY_FILE>',
  subject: '<GOOGLE_ADS_EMAIL>',
  scopes: ['https://www.googleapis.com/auth/adwords'],
});
```

### Customer

```ts
import { Customer } from 'google-ads';

const service = new Customer({
  auth: authClient,
  developer_token: '<DEVELOPER_TOKEN>',
});

const { resource_names: customers } = await service.listAccessibleCustomers();

// ...
```

### Search

```ts
import { GoogleAds } from 'google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
  },
  {
    customer_id: '<CUSTOMER_ID>',
  },
);

const customerClients = await service.search({
  query: `
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.resource_name,
      customer_client.client_customer,
      customer_client.level,
      customer_client.manager
    FROM customer_client
  `,
});

// ...
```

### Search stream

```ts
import { GoogleAds } from 'google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
  },
  {
    customer_id: '<CUSTOMER_CLIENT_ID>',
    login_customer_id: '<CUSTOMER_ID>',
  },
);

const response = service.searchStream({
  query: `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status
    FROM campaign
  `,
});

while (true) {
  const { value, done } = await response.next();
  if (done) {
    break;
  }
  console.log(value);
}
```

### Campaign

```ts
import { GoogleAds } from 'google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
  },
  {
    customer_id: '<CUSTOMER_CLIENT_ID>',
    login_customer_id: '<CUSTOMER_ID>',
  },
);

const campaigns = await service.search({
  query: `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status
    FROM campaign
  `,
});

// ...
```

### Mutate

```ts
import { GoogleAds } from 'google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
  },
  {
    customer_id: '<CUSTOMER_CLIENT_ID>',
    login_customer_id: '<CUSTOMER_ID>',
  },
);

const response = await service.mutate({
  mutate_operations: [
    {
      campaign_operation: {
        create: {
          // ...
        },
        update: {
          // ...
        },
        remove: '<CAMPAIGN_RESOURCE_NAME>',
      },
    },
  ],
});

// ...
```