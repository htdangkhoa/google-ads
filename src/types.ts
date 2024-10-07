import {
  ClientOptions,
  Interceptor as GRPCInterceptor,
  OAuth2Client,
} from '@grpc/grpc-js';

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> &
  Pick<T, TRequired>;

export type LoggingOptions = {
  summary?: boolean;
  detail?: boolean;
};

export interface ServiceOptions extends ClientOptions {
  auth: OAuth2Client;
  developer_token: string;
  logging?: boolean | LoggingOptions;
}

export interface CustomerOptions {
  customer_id?: string;
  login_customer_id?: string;
  linked_customer_id?: string;
}

export enum QUERY {
  SELECT = 'SELECT',
  FROM = 'FROM',
  WHERE = 'WHERE',
  ORDER_BY = 'ORDER BY',
  LIMIT = 'LIMIT',
  PARAMETERS = 'PARAMETERS',
}

export enum Operators {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT LIKE',
  CONTAINS_ANY = 'CONTAINS ANY',
  CONTAINS_ALL = 'CONTAINS ALL',
  CONTAINS_NONE = 'CONTAINS NONE',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  DURING = 'DURING',
  BETWEEN = 'BETWEEN',
  REGEXP_MATCH = 'REGEXP_MATCH',
  NOT_REGEXP_MATCH = 'NOT REGEXP_MATCH',
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum Functions {
  LAST_14_DAYS = 'LAST_14_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_BUSINESS_WEEK = 'LAST_BUSINESS_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  LAST_WEEK_MON_SUN = 'LAST_WEEK_MON_SUN',
  LAST_WEEK_SUN_SAT = 'LAST_WEEK_SUN_SAT',
  THIS_MONTH = 'THIS_MONTH',
  THIS_WEEK_MON_TODAY = 'THIS_WEEK_MON_TODAY',
  THIS_WEEK_SUN_TODAY = 'THIS_WEEK_SUN_TODAY',
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
}

export interface Condition {
  attribute: string;
  operator: Operators;
  value: string;
}

export interface OrderBy {
  attribute: string;
  direction?: OrderDirection;
}

export interface Interceptor {
  interceptCall: GRPCInterceptor;
}
