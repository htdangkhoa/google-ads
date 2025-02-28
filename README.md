<h1 align="center">Google Ads API Nodejs Client Library</h1>

<p align="center">
  <a href="https://developers.google.com/google-ads/api/docs/release-notes#v19_2025-02-26">
    <img src="https://img.shields.io/badge/google%20ads-v19%202025--02--26-009688.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/@htdangkhoa/google-ads">
    <img src="https://img.shields.io/npm/v/@htdangkhoa/google-ads.svg?style=flat-square">
  </a>
  <a href='https://coveralls.io/github/htdangkhoa/google-ads'>
    <img src='https://img.shields.io/coverallsCoverage/github/htdangkhoa/google-ads?style=flat-square' alt='Coverage Status' />
  </a>
  <a href='https://depfu.com/github/htdangkhoa/google-ads?project_id=40063'>
    <img src='https://badges.depfu.com/badges/b81badee90e335b411e120d083f3c154/count.svg' alt='depfu' />
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
  }, {
    customer_id: '<MANAGER_ID>',
  }
);

const response = service
  .setCustomerId('<CUSTOMER_ID>') // you can switch customer id
  .setLoginCustomerId('<MANAGER_ID>')
  .searchStream({
    query: `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status
      FROM campaign
    `,
  });

for await (const { results } of response) {
  // ...
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
  partial_failure: true,
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

## Logging

Requests are logged with a one line summary and the full request/response body and headers.

| Log type | Log name                        | Success level | Failure level |
|----------|---------------------------------|---------------|---------------|
| SUMMARY  | Google::Ads::GoogleAds::Summary | INFO          | WARN          |
| DETAIL   | Google::Ads::GoogleAds::Detail  | DEBUG         | INFO          |

### Basic

```ts
import { GoogleAds } from '@htdangkhoa/google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
    logging: true,
  },
  {
    customer_id: '<CUSTOMER_ID>',
  },
);
```

### Specific Log Type (SUMMARY or DETAIL)

```ts
import { GoogleAds } from '@htdangkhoa/google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
    logging: {
      summary: true,
      detail: false,
    },
  },
  {
    customer_id: '<CUSTOMER_ID>',
  },
);
```

## gRPC Client Options

The `ServiceOptions` is extended from `@grpc/grpc-js` [ClientOptions](https://grpc.github.io/grpc/node/grpc.Client.html#~ClientOptions:~:text=to%20the%20server-,options,-Object), so you can pass any options you want to the client.

```ts
import { GoogleAds } from '@htdangkhoa/google-ads';

const service = new GoogleAds(
  {
    auth: authClient,
    developer_token: '<DEVELOPER_TOKEN>',
    logging: {
      summary: true,
      detail: false,
    },
    interceptors: [
      // your interceptors
    ],
  },
  {
    customer_id: '<CUSTOMER_ID>',
  },
);
```

## Interceptors

See more at [Node.js gRPC Library](https://grpc.github.io/grpc/node/module-src_client_interceptors.html) and some examples [here](https://github.com/grpc/proposal/blob/master/L5-node-client-interceptors.md).

## Development

### Prerequisites

- Protocol Buffer Compiler (protoc) version 3.0.0 or greater. The latest version can be downloaded from [here](https://grpc.io/docs/protoc-installation/)
- Node.js version 16 or greater (LTS recommended) and npm version 8 or greater. The latest version of Node.js can be downloaded from [here](https://nodejs.org/en/download/)

### Building

1. Install dependencies

    ```sh
    yarn install
    ```

2. Pull in the new protos and compile them

    ```sh
    yarn generate <GOOGLE_ADS_API_VERSION>

    # example
    yarn generate v19
    ```
3. Make sure the version number in the `src` folder is correct (it should match the version number you passed to the `generate` command)

4. Run tests to make sure everything worked (you may need to update the version numbers here)

    ```sh
    yarn test
    ```

5. Build the library

    ```sh
    yarn build
    ```

6. Make a pull request, get it approved and merged into `main`

## License
The code in this project is released under the [MIT License](LICENSE).
