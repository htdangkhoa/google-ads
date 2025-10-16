import {
  CallProperties,
  InterceptorOptions,
  NextCall,
  InterceptingCall,
  Requester,
  RequesterBuilder,
  Metadata,
  ListenerBuilder,
  ServiceError,
  StatusObject,
  status,
} from '@grpc/grpc-js';
import log4js from 'log4js';
import type { Logger } from 'log4js';

import { HOST } from './constants.js';
import { LoggingOptions } from './types.js';
import { getGoogleAdsError } from './utils.js';
import { GoogleAdsFailure } from './generated/google/ads/googleads/v22/errors/errors.js';

const cleanEmpty = function (obj: any, defaults = [undefined, null]): any {
  if (defaults.includes(obj)) return;

  if (Array.isArray(obj))
    return obj
      .map((v) => (v && typeof v === 'object' ? cleanEmpty(v, defaults) : v))
      .filter((v) => !defaults.includes(v));

  return Object.entries(obj).length
    ? Object.entries(obj)
        .map(([k, v]) => [
          k,
          v && typeof v === 'object' ? cleanEmpty(v, defaults) : v,
        ])
        .reduce(
          (a, [k, v]) => (defaults.includes(v) ? a : { ...a, [k]: v }),
          {},
        )
    : obj;
};

interface Event {
  isSuccess: boolean;
  methodName: string;
  responseStatus: StatusObject;
  customerId?: string;
  requestId?: string;
  requestHeaders?: Metadata;
  request?: any;
  responseHeaders?: Metadata;
  response?: any;
}

export class LoggingInterceptor {
  private summaryLogger: Logger;
  private detailLogger: Logger;

  private messages: string[] = [];

  private requester: Requester;

  private interceptorOptions?: InterceptorOptions;
  private request?: any;
  private requestHeaders?: Metadata;
  private responseHeaders?: Metadata;
  private responseStatus?: StatusObject;

  constructor(private requestLogging: boolean | LoggingOptions) {
    this.requestLogging = requestLogging;

    log4js.configure({
      appenders: {
        out: { type: 'stdout', layout: { type: 'basic' } },
      },
      categories: {
        default: { appenders: ['out'], level: 'trace' },
      },
    });
    this.summaryLogger = log4js.getLogger('Google::Ads::GoogleAds::Summary');
    this.detailLogger = log4js.getLogger('Google::Ads::GoogleAds::Detail');

    this.requester = new RequesterBuilder()
      .withSendMessage((message, next) => {
        this.request = message;
        return next(message);
      })
      .withStart((headers, _listener, next) => {
        this.requestHeaders = headers;

        const listener = new ListenerBuilder()
          .withOnReceiveMetadata((metadata, next) => {
            this.responseHeaders = metadata;
            next(metadata);
          })
          .withOnReceiveStatus((status, next) => {
            this.responseStatus = status;
            next(status);
          })
          .build();

        return next(headers, listener);
      })
      .build();
  }

  callInvocationTransformer(
    properties: CallProperties<any, any>,
    originalCallInvocationTransformer?: (
      properties: CallProperties<any, any>,
    ) => CallProperties<any, any>,
  ): CallProperties<any, any> {
    let props = properties;

    if (typeof originalCallInvocationTransformer === 'function') {
      props = originalCallInvocationTransformer?.(props);
    }

    const originalCallback = props.callback;

    // clear messages from previous call
    this.messages.length = 0;

    props.callback = (error: ServiceError | null, value?: any) => {
      this.callback(error, value);

      if (typeof originalCallback === 'function') {
        originalCallback(error, value);
      }
    };

    return props;
  }

  interceptCall(
    options: InterceptorOptions,
    nextCall: NextCall,
  ): InterceptingCall {
    this.interceptorOptions = options;
    return new InterceptingCall(nextCall(options), this.requester);
  }

  private callback(err: ServiceError | null, value?: any) {
    const isSuccess = !err && this.responseStatus?.code === status.OK.valueOf();

    const methodName = this.interceptorOptions?.method_definition.path ?? '';
    const requestHeaders = this.requestHeaders ?? new Metadata();
    const request = this.request ?? {};
    const responseHeaders = this.responseHeaders ?? new Metadata();

    const responseStatus: StatusObject = {
      code:
        (!isSuccess ? err!.code : this.responseStatus?.code) ?? status.UNKNOWN,
      details: (!isSuccess ? err!.details : this.responseStatus?.details) ?? '',
      metadata:
        (!isSuccess ? err!.metadata : this.responseStatus?.metadata) ??
        new Metadata(),
    };

    this.logSummary({
      isSuccess,
      methodName,
      responseStatus,
      customerId: this.request?.['customer_id'],
      requestId: requestHeaders?.get('request-id')?.toString(),
    });

    this.logDetail({
      isSuccess,
      methodName,
      responseStatus,
      requestHeaders,
      request,
      responseHeaders,
      response: err || value,
    });
  }

  private logSummary(event: Event) {
    if (
      this.requestLogging === true ||
      (<LoggingOptions>this.requestLogging).summary === true
    ) {
      const { isSuccess, methodName, responseStatus, customerId, requestId } =
        event;

      const messages = [
        `${isSuccess ? 'SUCCESS' : 'FAILURE'} REQUEST SUMMARY.`,
        `Host=${HOST},`,
        `Method=${methodName},`,
        `ClientCustomerId=${customerId},`,
        `RequestId=${requestId},`,
        `ResponseCode=${responseStatus.code}`,
      ];

      if (isSuccess) {
        const msg = messages.join(' ').concat('.');
        this.summaryLogger.info(msg);
      } else {
        let msg = messages
          .join(' ')
          .concat(`, Fault=${responseStatus.details}`);

        if (!msg.endsWith('.')) msg += '.';

        this.summaryLogger.warn(msg);
      }
    }
  }

  private logDetail(event: Event) {
    if (
      this.requestLogging === true ||
      (<LoggingOptions>this.requestLogging).detail === true
    ) {
      const {
        isSuccess,
        methodName,
        responseStatus,
        requestHeaders,
        request,
        responseHeaders,
        response,
      } = event;

      const messages = [
        `${isSuccess ? 'SUCCESS' : 'FAILURE'} REQUEST DETAIL.`,
        'Request',
        '-------',
        `MethodName: ${methodName}`,
        `Host: ${HOST}`,
        `Headers: ${JSON.stringify(requestHeaders?.getMap() ?? {})}`,
        `Body: ${JSON.stringify(request)}`,
        `\nResponse`,
        '--------',
        `Headers: ${JSON.stringify(responseHeaders?.getMap() ?? {})}`,
      ];

      if (!isSuccess) {
        const serviceError = <ServiceError>response;

        const { errors } = getGoogleAdsError(serviceError) as GoogleAdsFailure;
        const [googleAdsError] = errors ?? [];

        const [errorType, errorCode] =
          Object.entries<any>(googleAdsError?.error_code ?? {}).find(
            ([key, value]) => ![undefined, null].includes(value),
          ) ?? [];

        const errorMessage = googleAdsError?.message ?? responseStatus!.details;

        messages.push(
          `Body: ${errorMessage}`,
          `ResponseCode: ${responseStatus.code}`,
          `ErrorCode: ${errorCode} (${errorType})`,
          `FailureMessage: ${responseStatus!.details}`,
        );
        this.detailLogger.info(messages.join('\n'));
      } else {
        messages.push(
          `Body: ${JSON.stringify(cleanEmpty(response))}`,
          `ResponseCode: ${responseStatus.code}`,
        );
        this.detailLogger.debug(messages.join('\n'));
      }
    }
  }
}
