import deepmerge from 'deepmerge';
import { Condition, OrderBy, OrderDirection, QUERY } from './types.js';

export class QueryBuilder {
  private _attributes: string[] = [];

  private _table: string = '';

  private _conditions: Condition[] = [];

  private _orders: OrderBy[] = [];

  private _limit: number = 0;

  private _parameters: Record<string, string> = {};

  select(...args: string[]) {
    this._attributes.push(...args);
    return this;
  }

  from(table: string) {
    this._table = table;
    return this;
  }

  where(...args: Condition[]) {
    this._conditions.push(...args);
    return this;
  }

  orderBy(...args: OrderBy[]) {
    this._orders.push(...args);
    return this;
  }

  limit(limit: number) {
    this._limit = limit;
    return this;
  }

  parameters(parameters: Record<string, string>) {
    this._parameters = <Record<string, string>>(
      deepmerge.all([this._parameters, parameters])
    );
    return this;
  }

  build() {
    const query: (string | number)[] = [];

    if (this._attributes.length) {
      query.push(QUERY.SELECT, this._attributes.join(', '));
    }

    if (this._table) {
      query.push(QUERY.FROM, this._table);
    }

    if (this._conditions.length) {
      query.push(
        QUERY.WHERE,
        this._conditions
          .map(
            (condition) =>
              `${condition.attribute} ${condition.operator} ${condition.value}`,
          )
          .join(' AND '),
      );
    }

    if (this._orders.length) {
      query.push(
        QUERY.ORDER_BY,
        this._orders
          .map(
            (order) =>
              `${order.attribute} ${order.direction || OrderDirection.ASC}`,
          )
          .join(', '),
      );
    }

    if (this._limit) {
      query.push(QUERY.LIMIT, this._limit);
    }

    const parameterKeys = Object.keys(this._parameters);
    if (parameterKeys.length) {
      query.push(
        QUERY.PARAMETERS,
        parameterKeys
          .map((key) => `${key} = ${this._parameters[key]}`)
          .join(', '),
      );
    }

    return query.join(' ');
  }
}
