import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Inject, Injectable, Scope } from '@nestjs/common';
import type { AvesSdkConfig } from '../types/common';
import { AVES_SDK_CONFIG } from '../tokens';

export interface IXmlHttpClient {
  postXml<TRequest extends object, TResponse = unknown>(
    endpoint: string,
    rootElementName: string,
    request: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse>;
}

@Injectable({ scope: Scope.DEFAULT })
export class XmlHttpClient implements IXmlHttpClient {
  private readonly httpClient: AxiosInstance;
  private readonly xmlBuilder: XMLBuilder;
  private readonly xmlParser: XMLParser;

  constructor(@Inject(AVES_SDK_CONFIG) private readonly config: AvesSdkConfig) {
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: typeof config.timeout === 'number' ? config.timeout : 30000,
      headers: {
        'Content-Type': 'application/xml',
        Accept: 'application/xml, text/xml, */*;q=0.1',
      },
      transitional: { clarifyTimeoutError: true },
      validateStatus: (s) => s >= 200 && s < 300,
    });

    this.xmlBuilder = new XMLBuilder({
      attributeNamePrefix: '@',
      ignoreAttributes: false,
      suppressEmptyNode: true,
      format: false,
    });

    this.xmlParser = new XMLParser({
      attributeNamePrefix: '@',
      ignoreAttributes: false,
      parseAttributeValue: false,
      trimValues: true,
      isArray: (name) => {
        const arrayNames = [
          'Field',
          'Item',
          'Service',
          'Passenger',
          'Payment',
          'MasterRecord',
          'Request',
          'Notes',
          'ServiceID',
        ];
        return arrayNames.includes(name);
      },
    });
  }

  public async postXml<TRequest extends object, TResponse = unknown>(
    endpoint: string,
    rootElementName: string,
    request: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const xmlPayload = this.xmlBuilder.build({ [rootElementName]: request });
    const response = await this.httpClient.post(endpoint, xmlPayload, config);
    const data = this.xmlParser.parse(response.data);
    return data as TResponse;
  }
}
