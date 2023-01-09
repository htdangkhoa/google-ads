import allProtos from 'google-ads-node';
import { grpc } from 'google-gax';
import { VERSION } from './constants';

export type AllServices = Omit<typeof allProtos, typeof VERSION>;
export type ServiceName = keyof Omit<typeof allProtos, typeof VERSION>;

export interface ServiceOptions {
  auth: grpc.OAuth2Client;
  developer_token: string;
}

export interface CustomerOptions {
  customer_id: string;
  login_customer_id?: string;
  linked_customer_id?: string;
}
