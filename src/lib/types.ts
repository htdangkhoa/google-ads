import allProtos from 'google-ads-node';

export const VERSION = 'v12' as const;

export type AllServices = Omit<typeof allProtos, typeof VERSION>;
export type ServiceName = keyof Omit<typeof allProtos, typeof VERSION>;

export interface CustomerOptions {
  customer_id: string;
  login_customer_id?: string;
  linked_customer_id?: string;
}
