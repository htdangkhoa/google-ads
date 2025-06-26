import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { credentials, Metadata, OAuth2Client } from '@grpc/grpc-js';

import { getCredentials } from '../src/utils';

type MockOAuth2Client = OAuth2Client & {
  getRequestHeaders: () => Promise<Map<string, string>>;
};

// Mock the grpc-js credentials
vi.mock('@grpc/grpc-js', async () => {
  const actual = await vi.importActual('@grpc/grpc-js');
  return {
    ...(actual as any),
    credentials: {
      createSsl: vi.fn().mockReturnValue('ssl-credentials'),
      createFromMetadataGenerator: vi.fn((generator) => {
        return {
          _generator: generator,
          _type: 'call-credentials',
        };
      }),
      combineChannelCredentials: vi.fn((ssl, callCredentials) => {
        return {
          _ssl: ssl,
          _callCredentials: callCredentials,
          _type: 'channel-credentials',
        };
      }),
    },
    Metadata: vi.fn().mockImplementation(() => {
      const store = new Map();
      return {
        set: (key, value) => store.set(key, value),
        get: (key) => store.get(key),
        getMap: () => store,
      };
    }),
  };
});

describe('getCredentials', () => {
  let mockAuthClient: MockOAuth2Client;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock OAuth2Client with headers that are iterable
    mockAuthClient = {
      getRequestHeaders: vi.fn().mockResolvedValue(
        new Map([
          ['authorization', 'Bearer mock-token'],
          ['x-goog-api-client', 'mock-client'],
        ]),
      ),
    } as unknown as MockOAuth2Client;
  });

  it('should create SSL credentials', () => {
    getCredentials(mockAuthClient);
    expect(credentials.createSsl).toHaveBeenCalled();
  });

  it('should create call credentials with metadata generator', () => {
    getCredentials(mockAuthClient);
    expect(credentials.createFromMetadataGenerator).toHaveBeenCalled();
  });

  it('should combine SSL and call credentials', () => {
    const result = getCredentials(mockAuthClient);
    expect(credentials.combineChannelCredentials).toHaveBeenCalledWith(
      'ssl-credentials',
      expect.objectContaining({ _type: 'call-credentials' }),
    );
    expect(result).toEqual(
      expect.objectContaining({ _type: 'channel-credentials' }),
    );
  });

  describe('metadata generator', () => {
    let metadataGenerator: Function;
    let callback: Mock;

    beforeEach(() => {
      getCredentials(mockAuthClient);
      metadataGenerator = (
        credentials.createFromMetadataGenerator as unknown as Mock
      ).mock.calls[0][0];
      callback = vi.fn();
    });

    it('should call getRequestHeaders with service_url', async () => {
      metadataGenerator({ service_url: 'https://example.com' }, callback);
      // Wait for the promise to resolve
      await new Promise(process.nextTick);
      expect(mockAuthClient.getRequestHeaders).toHaveBeenCalledWith(
        'https://example.com',
      );
    });

    it('should create metadata with headers from getRequestHeaders', async () => {
      metadataGenerator({ service_url: 'https://example.com' }, callback);
      // Wait for the promise to resolve
      await new Promise(process.nextTick);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          set: expect.any(Function),
          get: expect.any(Function),
          getMap: expect.any(Function),
        }),
      );
    });

    it('should handle when both globalThis.Headers and global.Headers are undefined', async () => {
      // Store original Headers objects
      const originalGlobalThisHeaders = globalThis.Headers;
      const originalGlobalHeaders = (global as any).Headers;
      
      // Make sure both Headers are not defined
      delete globalThis.Headers;
      delete (global as any).Headers;

      try {
        metadataGenerator({ service_url: 'https://example.com' }, callback);
        // Wait for the promise to resolve
        await new Promise(process.nextTick);
        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            set: expect.any(Function),
            get: expect.any(Function),
            getMap: expect.any(Function),
          }),
        );
      } finally {
        // Restore original Headers
        if (originalGlobalThisHeaders) {
          globalThis.Headers = originalGlobalThisHeaders;
        }
        
        if (originalGlobalHeaders) {
          (global as any).Headers = originalGlobalHeaders;
        }
      }
    });

    it('should handle Headers global object if present in globalThis', async () => {
      // Store original Headers objects
      const originalGlobalThisHeaders = globalThis.Headers;
      const originalGlobalHeaders = (global as any).Headers;
      
      // Set up test condition: only globalThis.Headers exists
      globalThis.Headers = class Headers {} as any;
      delete (global as any).Headers;

      try {
        metadataGenerator({ service_url: 'https://example.com' }, callback);
        // Wait for the promise to resolve
        await new Promise(process.nextTick);
        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            set: expect.any(Function),
            get: expect.any(Function),
            getMap: expect.any(Function),
          }),
        );
      } finally {
        // Restore original Headers
        if (originalGlobalThisHeaders) {
          globalThis.Headers = originalGlobalThisHeaders;
        } else {
          delete globalThis.Headers;
        }
        
        if (originalGlobalHeaders) {
          (global as any).Headers = originalGlobalHeaders;
        }
      }
    });

    it('should handle Headers global object if present in global', async () => {
      // Store original Headers objects
      const originalGlobalThisHeaders = globalThis.Headers;
      const originalGlobalHeaders = (global as any).Headers;
      
      // Set up test condition: only global.Headers exists
      delete globalThis.Headers;
      (global as any).Headers = class Headers {};

      try {
        metadataGenerator({ service_url: 'https://example.com' }, callback);
        // Wait for the promise to resolve
        await new Promise(process.nextTick);
        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            set: expect.any(Function),
            get: expect.any(Function),
            getMap: expect.any(Function),
          }),
        );
      } finally {
        // Restore original Headers
        if (originalGlobalThisHeaders) {
          globalThis.Headers = originalGlobalThisHeaders;
        }

        if (originalGlobalHeaders) {
          (global as any).Headers = originalGlobalHeaders;
        } else {
          delete (global as any).Headers;
        }
      }
    });
    
    it('should handle when both globalThis.Headers and global.Headers are defined', async () => {
      // Store original Headers objects
      const originalGlobalThisHeaders = globalThis.Headers;
      const originalGlobalHeaders = (global as any).Headers;
      
      // Set up test condition: both Headers exist
      globalThis.Headers = class GlobalThisHeaders {} as any;
      (global as any).Headers = class GlobalHeaders {};

      try {
        metadataGenerator({ service_url: 'https://example.com' }, callback);
        // Wait for the promise to resolve
        await new Promise(process.nextTick);
        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            set: expect.any(Function),
            get: expect.any(Function),
            getMap: expect.any(Function),
          }),
        );
      } finally {
        // Restore original Headers
        if (originalGlobalThisHeaders) {
          globalThis.Headers = originalGlobalThisHeaders;
        } else {
          delete globalThis.Headers;
        }
        
        if (originalGlobalHeaders) {
          (global as any).Headers = originalGlobalHeaders;
        } else {
          delete (global as any).Headers;
        }
      }
    });

    it('should handle error from getRequestHeaders', async () => {
      const error = new Error('Auth error');
      mockAuthClient.getRequestHeaders = vi.fn().mockRejectedValue(error);

      metadataGenerator({ service_url: 'https://example.com' }, callback);
      // Wait for the promise to resolve
      await new Promise(process.nextTick);
      expect(callback).toHaveBeenCalledWith(error);
    });
  });
});
