import {
  DynamicModule,
  Module,
  Provider,
  Type,
  ModuleMetadata,
  Global,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AvesService } from './aves.service';
import { XmlHttpClient } from '../http/xml-http-client';
import { XML_HTTP_CLIENT } from '../tokens';
import { avesConfig } from '../config/aves.config';
import { AvesSdkConfig } from '../types/common';
import { AVES_SDK_CONFIG } from '../tokens';
import { configValidationSchema } from 'src/validation/aves-validation';

/**
 * AvesModule - Dynamic module for AVES SDK integration
 *
 * Provides both synchronous and asynchronous configuration options
 * for the AVES booking system integration.
 *
 * @example
 * ```typescript
 * // Synchronous configuration
 * AvesModule.forRoot({
 *   baseUrl: 'https://api.aves.com',
 *   hostId: 'your-host-id',
 *   xtoken: 'your-token'
 * })
 *
 * // Asynchronous configuration
 * AvesModule.forRootAsync({
 *   useFactory: (configService: ConfigService) => ({
 *     baseUrl: configService.get('AVES_BASE_URL'),
 *     hostId: configService.get('AVES_HOST_ID'),
 *     xtoken: configService.get('AVES_XTOKEN')
 *   }),
 *   inject: [ConfigService]
 * })
 * ```
 */

@Global()
@Module({})
export class AvesModule {
  static readonly MODULE_NAME = 'AvesModule';
  static readonly VERSION = '1.0.0';
  /**
   * Creates a dynamically configured module with synchronous configuration
   * @param config - The AVES SDK configuration object
   * @returns DynamicModule with configured providers
   */
  static forRoot(config: AvesSdkConfig): DynamicModule {
    const validatedConfig = this.validateConfig(config);

    return {
      module: AvesModule,
      imports: [ConfigModule.forFeature(avesConfig)],
      providers: [
        {
          provide: AVES_SDK_CONFIG,
          useValue: validatedConfig,
        },
        this.createXmlHttpClientProvider(),
        AvesService,
      ],
      exports: [AvesService, XML_HTTP_CLIENT],
    };
  }

  /**
   * Creates a dynamically configured module with asynchronous configuration
   * @param options - Async configuration options
   * @returns DynamicModule with configured providers
   */
  static forRootAsync(options: AvesModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: AvesModule,
      imports: [
        ...(options.imports ?? []),
        ConfigModule.forFeature(avesConfig),
      ],
      providers: [
        ...asyncProviders,
        this.createXmlHttpClientProvider(),
        AvesService,
      ],
      exports: [AvesService, XML_HTTP_CLIENT],
    };
  }

  /**
   * Creates XML HTTP client provider
   * @private
   */
  private static createXmlHttpClientProvider(): Provider {
    return {
      provide: XML_HTTP_CLIENT,
      useClass: XmlHttpClient,
    };
  }

  /**
   * Creates async providers for configuration
   * @private
   */
  private static createAsyncProviders(
    options: AvesModuleAsyncOptions
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: AVES_SDK_CONFIG,
          useFactory: async (...args: any[]) => {
            try {
              const config = await options.useFactory!(...args);
              return this.validateConfig(config);
            } catch (error) {
              throw new Error(
                `Failed to create Aves configuration: ${error.message}`
              );
            }
          },
          inject: options.inject ?? [],
        },
      ];
    }

    const useClass = options.useClass || options.useExisting;
    if (!useClass) {
      throw new Error(
        'Invalid AvesModule async options: provide useFactory, useClass, or useExisting'
      );
    }

    const providers: Provider[] = [
      {
        provide: AVES_SDK_CONFIG,
        useFactory: async (
          factory: AvesOptionsFactory
        ): Promise<AvesSdkConfig> => {
          try {
            const config = await factory.createAvesOptions();
            return this.validateConfig(config);
          } catch (error) {
            throw new Error(
              `Failed to create Aves configuration: ${error.message}`
            );
          }
        },
        inject: [useClass],
      },
    ];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  /**
   * Validates the AVES SDK configuration
   * @private
   */
  private static validateConfig(config: AvesSdkConfig): AvesSdkConfig {
    const validatedConfig = configValidationSchema.safeParse(config);
    if (!validatedConfig.success) {
      throw new Error(
        `Invalid AVES SDK configuration: ${validatedConfig.error.issues
          .map((issue) => issue.message)
          .join(', ')}`
      );
    }

    return validatedConfig.data;
  }
}

/**
 * Interface for AVES options factory
 * Used when creating async configuration providers
 */
export interface AvesOptionsFactory {
  createAvesOptions(): Promise<AvesSdkConfig> | AvesSdkConfig;
}

/**
 * Async configuration options for AvesModule
 * Supports factory functions, existing services, or new service classes
 */
export interface AvesModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /** Use an existing service instance */
  useExisting?: Type<AvesOptionsFactory>;
  /** Use a new service class */
  useClass?: Type<AvesOptionsFactory>;
  /** Use a factory function */
  useFactory?: (...args: any[]) => Promise<AvesSdkConfig> | AvesSdkConfig;
  /** Dependencies to inject into the factory function */
  inject?: (string | symbol | Type<any>)[];
}
