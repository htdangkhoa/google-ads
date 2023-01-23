import { CustomerServiceClient } from '../generated/google/ads/googleads/v12/services/customer_service';
import { GoogleAdsServiceClient } from '../generated/google/ads/googleads/v12/services/google_ads_service';
import { Campaign } from '../generated/google/ads/googleads/v12/resources/campaign';
import { AdvertisingChannelTypeEnum_AdvertisingChannelType } from '../generated/google/ads/googleads/v12/enums/advertising_channel_type';
import { MOCK_ADDRESS, MOCK_CREDENTIALS } from './test-utils';

describe('CustomerServiceClient', () => {
  it('should be exported', () => {
    expect(typeof CustomerServiceClient).toBe('function');
  });

  it('should be able to create a client', () => {
    const client = new CustomerServiceClient(MOCK_ADDRESS, MOCK_CREDENTIALS);

    expect(client).toBeInstanceOf(CustomerServiceClient);

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
    expect(typeof GoogleAdsServiceClient).toBe('function');
  });

  it('should be able to create a client', () => {
    const client = new GoogleAdsServiceClient(MOCK_ADDRESS, MOCK_CREDENTIALS);

    expect(client).toBeInstanceOf(GoogleAdsServiceClient);

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
  const campaign = Campaign.fromPartial({
    name: 'Planet Express',
    advertising_channel_type:
      AdvertisingChannelTypeEnum_AdvertisingChannelType.SEARCH,
  });

  it('should be exported', () => {
    expect(typeof Campaign).toBe('object');
  });

  it('should have a name', () => {
    expect(campaign.name).toBe('Planet Express');
  });

  it('should have an advertising channel type', () => {
    expect(campaign.advertising_channel_type).toBe(
      AdvertisingChannelTypeEnum_AdvertisingChannelType.SEARCH,
    );
  });
});
