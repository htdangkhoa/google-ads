import {
  InterceptingCall,
  InterceptorOptions,
  Metadata,
  Interceptor as GRPCInterceptor,
  StatusObject,
} from '@grpc/grpc-js';
import { Status } from '@grpc/grpc-js/build/src/constants.js';
import {
  FullRequester,
  ListenerBuilder,
  NextCall,
  RequesterBuilder,
} from '@grpc/grpc-js/build/src/client-interceptors.js';
import log4js from 'log4js';
import type { Logger } from 'log4js';
import { Interceptor, LoggingOptions } from './types.js';
import { HOST } from './constants.js';

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

export class LoggingInterceptor implements Interceptor {
  private requestLogging: boolean | LoggingOptions;
  private summaryLogger: Logger;
  private detailLogger: Logger;

  constructor(requestLogging: boolean | LoggingOptions) {
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
  }

  private logSummary(
    responseStatus: StatusObject,
    request: any,
    options: InterceptorOptions,
    responseHeaders: Metadata,
  ) {
    if (
      this.requestLogging === true ||
      (<LoggingOptions>this.requestLogging).summary === true
    ) {
      const isSuccess = responseStatus.code == Status.OK.valueOf();

      const messages = [
        `${isSuccess ? 'SUCCESS' : 'FAILURE'} REQUEST SUMMARY.`,
        `Host=${HOST}`,
        `Method=${options.method_definition.path}`,
        `ClientCustomerId=${request.customer_id}`,
        `RequestId=${responseHeaders.get('request-id')}`,
        `ResponseCode=${responseStatus.code}`,
      ];

      if (isSuccess) {
        this.summaryLogger.info(messages.join(' '));
      } else {
        messages.push(`Fault=${responseStatus.details}`);
        this.summaryLogger.warn(messages.join(' '));
      }
    }
  }

  private logDetail(
    responseStatus: StatusObject,
    request: any,
    requestHeaders: Metadata,
    options: InterceptorOptions,
    response: any,
    responseHeaders: Metadata,
  ) {
    if (
      this.requestLogging === true ||
      (<LoggingOptions>this.requestLogging).detail === true
    ) {
      const isSuccess = responseStatus.code == Status.OK.valueOf();

      const messages = [
        `${isSuccess ? 'SUCCESS' : 'FAILURE'} REQUEST DETAIL.`,
        'Request',
        '-------',
        `MethodName: ${options.method_definition.path}`,
        `Host: ${HOST}`,
        `Headers: ${JSON.stringify(requestHeaders.getMap())}`,
        `Body: ${JSON.stringify(request)}`,
        `\nResponse`,
        '--------',
        `Headers: ${JSON.stringify(responseHeaders.getMap())}`,
        `Body: ${JSON.stringify(cleanEmpty(response))}`,
        `ResponseCode: ${responseStatus.code}`,
      ];

      if (isSuccess) {
        this.detailLogger.debug(messages.join('\n'));
      } else {
        messages.push(`Fault: ${responseStatus.details}`);
        this.detailLogger.info(messages.join('\n'));
      }
    }
  }

  interceptCall: GRPCInterceptor = (
    options: InterceptorOptions,
    nextCall: NextCall,
  ) => {
    let request: any;
    let requestHeaders: Metadata;
    let response: any;
    let responseHeaders: Metadata;

    const requester: Partial<FullRequester> = new RequesterBuilder()
      .withStart((headers, responseListener, next) => {
        requestHeaders = headers;

        const listener = new ListenerBuilder()
          .withOnReceiveMessage((message, next) => {
            response = message;
            next(message);
          })
          .withOnReceiveMetadata((metadata, next) => {
            responseHeaders = metadata;
            next(metadata);
          })
          .withOnReceiveStatus((status, next) => {
            try {
              this.logSummary(status, request, options, responseHeaders);
              this.logDetail(
                status,
                request,
                requestHeaders,
                options,
                response,
                responseHeaders,
              );
            } catch (error) {
            } finally {
              next(status);
            }
          })
          .build();

        next(headers, listener);
      })
      .withSendMessage((message, next) => {
        request = message;
        next(message);
      })
      .withHalfClose((next) => {
        next();
      })
      .withCancel((next) => {
        next();
      })
      .build();

    return new InterceptingCall(nextCall(options), requester);
  };
}
