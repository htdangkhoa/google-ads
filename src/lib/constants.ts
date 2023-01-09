import { protos } from 'google-ads-node';

export const VERSION = 'v12' as const;

export import errors = protos.google.ads.googleads.v12.errors;

export const FAILURE_KEY = `google.ads.googleads.${VERSION}.errors.googleadsfailure-bin`;
