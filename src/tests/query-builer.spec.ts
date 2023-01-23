import { Functions, Operators, OrderDirection } from '../lib';
import { QueryBuilder } from '../lib/QueryBuilder';

describe('QueryBuilder', () => {
  it('correctly builds a query', () => {
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
          value: '0',
        },
        {
          attribute: 'segments.device',
          operator: Operators.EQUALS,
          value: 'MOBILE',
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
          direction: OrderDirection.DESC,
        },
        {
          attribute: 'segments.date',
        },
      )
      .limit(10)
      .parameters({
        include_drafts: 'true',
      })
      .build();

    expect(query).toEqual(
      'SELECT campaign.id, campaign.name, segments.device, metrics.clicks FROM campaign WHERE metrics.impressions > 0 AND segments.device = MOBILE AND segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC, segments.date ASC LIMIT 10 PARAMETERS include_drafts = true',
    );
  });
});
