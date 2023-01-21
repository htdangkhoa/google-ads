<h1 align="center">Google Ads API Nodejs Client Library</h1>

<p align="center">
  <a href="https://developers.google.com/google-ads/api/docs/release-notes">
    <img src="https://img.shields.io/badge/google%20ads-v12-009688.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/@htdangkhoa/google-ads">
    <img src="https://img.shields.io/npm/v/@htdangkhoa/google-ads.svg?style=flat-square">
  </a>
</p>

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
import { Customer } from '@htdangkhoa/google-ads';

const service = new Customer({
  auth: authClient,
  developer_token: '<DEVELOPER_TOKEN>',
});

const { resource_names: customers } = await service.listAccessibleCustomers();

// ...
```

### Search

```ts
import { GoogleAds } from '@htdangkhoa/google-ads';

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
import { GoogleAds } from '@htdangkhoa/google-ads';

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
import { GoogleAds } from '@htdangkhoa/google-ads';

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
import { GoogleAds } from '@htdangkhoa/google-ads';

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

### Query Builder

```ts
import { QueryBuilder } from '@htdangkhoa/google-ads';

const query = new QueryBuilder()
  .select(
    'campaign.id',
    'campaign.name',
    'segments.device',
    'metrics.clicks',
  )
  .from('campaign')
  .where(
    {
      attribute: 'metrics.impressions',
      operator: Operators.GREATER_THAN,
      value: "0",
    },
    {
      attribute: 'segments.device',
      operator: Operators.EQUALS,
      value: "MOBILE",
    },
    {
      attribute: 'segments.date',
      operator: Operators.DURING,
      value: Functions.LAST_30_DAYS,
    },
  )
  .orderBy(
    {
      attribute: 'metrics.clicks',
      direction: Order.DESC,
    },
  )
  .limit(10)
  .build();

const response = await service.search({ query });
```

## Development

1. Install dependencies

    ```sh
    yarn install
    ```

2. Patch `ts-proto` fix the fieldmask issue

    ```sh
    yarn patch-package ts-proto
    ```

3. Pull in the new protos and compile them

    ```sh
    yarn generate <GOOGLE_API_VERSION>

    # example
    yarn generate v12
    ```

4. Build the library

    ```sh
    yarn build
    ```

5. Make a pull request, get it approved and merged into master

6. Publish to npm