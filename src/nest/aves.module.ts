import {
  DynamicModule,
  Module,
  Provider,
  Type,
  ModuleMetadata,
  FactoryProvider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AvesService } from './aves.service';
import { XmlHttpClient } from '../http/xml-http-client';
import { XML_HTTP_CLIENT } from '../tokens';
import { avesConfig } from '../config/aves.config';
import { AvesSdkConfig } from '../types/common';
import { AVES_SDK_CONFIG } from '../tokens';

@Module({})
export class AvesModule {
  static forRoot(config: AvesSdkConfig): DynamicModule {
    const configProvider: Provider = {
      provide: AVES_SDK_CONFIG,
      useValue: config,
    };
    const xmlHttpClientProvider: Provider = {
      provide: XML_HTTP_CLIENT,
      useClass: XmlHttpClient,
    };
    return {
      module: AvesModule,
      imports: [ConfigModule.forFeature(avesConfig)],
      providers: [configProvider, xmlHttpClientProvider, AvesService],
      exports: [AvesService, XML_HTTP_CLIENT],
    };
  }

  static forRootAsync(options: AvesModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const xmlHttpClientProvider: Provider = {
      provide: XML_HTTP_CLIENT,
      useClass: XmlHttpClient,
    };

    return {
      module: AvesModule,
      imports: [
        ...(options.imports ?? []),
        ConfigModule.forFeature(avesConfig),
      ],
      providers: [...asyncProviders, xmlHttpClientProvider, AvesService],
      exports: [AvesService, XML_HTTP_CLIENT],
    };
  }

  private static createAsyncProviders(
    options: AvesModuleAsyncOptions
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: AVES_SDK_CONFIG,
          useFactory: options.useFactory,
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
        ): Promise<AvesSdkConfig> =>
          await Promise.resolve(factory.createAvesOptions()),
        inject: [useClass],
      },
    ];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }
}

export interface AvesOptionsFactory {
  createAvesOptions(): Promise<AvesSdkConfig> | AvesSdkConfig;
}

export interface AvesModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AvesOptionsFactory>;
  useClass?: Type<AvesOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AvesSdkConfig> | AvesSdkConfig;
  inject?: FactoryProvider['inject'];
}
