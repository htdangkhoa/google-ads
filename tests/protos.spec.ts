import { describe, it, expect } from 'vitest';

import { services, enums, resources } from '../src';
import { MOCK_ADDRESS, MOCK_CREDENTIALS } from './test-utils';

describe('CustomerServiceClient', () => {
  it('should be exported', () => {
    expect(typeof services.CustomerServiceClient).toBe('function');
  });

  it('should be able to create a client', () => {
    const client = new services.CustomerServiceClient(
      MOCK_ADDRESS,
      MOCK_CREDENTIALS,
    );

    expect(client).toBeInstanceOf(services.CustomerServiceClient);

    expect(client).toEqual(
      expect.objectContaining({
        listAccessibleCustomers: expect.any(Function),
      }),
    );

    client.close();
  });
});

describe('GoogleAdsServiceClient', () => {
  it('should be exported', () => {
    expect(typeof services.GoogleAdsServiceClient).toBe('function');
  });

  it('should be able to create a client', () => {
    const client = new services.GoogleAdsServiceClient(
      MOCK_ADDRESS,
      MOCK_CREDENTIALS,
    );

    expect(client).toBeInstanceOf(services.GoogleAdsServiceClient);

    expect(client).toEqual(
      expect.objectContaining({
        search: expect.any(Function),
        searchStream: expect.any(Function),
        mutate: expect.any(Function),
      }),
    );

    client.close();
  });
});

describe('Campaign', () => {
  const campaign = resources.Campaign.fromPartial({
    name: 'Planet Express',
    advertising_channel_type:
      enums.AdvertisingChannelTypeEnum_AdvertisingChannelType.SEARCH,
  });

  it('should be exported', () => {
    expect(typeof resources.Campaign).toBe('object');
  });

  it('should have a name', () => {
    expect(campaign.name).toBe('Planet Express');
  });

  it('should have an advertising channel type', () => {
    expect(campaign.advertising_channel_type).toBe(
      enums.AdvertisingChannelTypeEnum_AdvertisingChannelType.SEARCH,
    );
  });
});
