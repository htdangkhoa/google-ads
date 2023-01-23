import {
  MockCustomer,
  MOCK_CUSTOMERS,
  MOCK_DEVELOPER_TOKEN,
  MOCK_OAUTH2_CLIENT,
} from './test-utils';

let customer: MockCustomer;

beforeAll(async () => {
  customer = new MockCustomer({
    auth: MOCK_OAUTH2_CLIENT,
    developer_token: MOCK_DEVELOPER_TOKEN,
  });
});

describe('listAccessibleCustomers', () => {
  it('should be able to list accessible customers', async () => {
    const { resource_names: customers } =
      await customer.mockListAccessibleCustomers();

    expect(customers).toEqual(MOCK_CUSTOMERS);
  });
});
