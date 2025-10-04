import { Inject, Injectable } from '@nestjs/common';
import { AVES_SDK_CONFIG } from '../tokens';
import type {
  AvesSdkConfig,
  AvesResponseRoot,
  RqHeader,
} from '../types/common';
import type { IXmlHttpClient } from '../http/xml-http-client';
import { XML_HTTP_CLIENT } from '../tokens';
import type {
  SearchMasterRecordRQ,
  SearchMasterRecordRS,
  ManageMasterRecordRQ,
  CustomerRecordRS,
  BookFileRQ,
  BookingFileRS,
  ModiFileHeaderRQ,
  ModiFileHeaderRS,
  ModFileServicesRQ,
  SetStatusRQ,
  SetStatusServiceRS,
  CancelFileRQ,
  CancelFileRS,
  FilePaymentListRQ,
  FilePaymentListRS,
  PrintBookingDocumentRQ,
  PrintBookingDocumentRS,
} from '../types/interfaces';
import { WrapRequestDto } from './dto/wrap-request.dto';

@Injectable()
export class AvesService {
  constructor(
    @Inject(AVES_SDK_CONFIG) private readonly config: AvesSdkConfig,
    @Inject(XML_HTTP_CLIENT) private readonly http: IXmlHttpClient
  ) {}

  private buildHeader(): RqHeader {
    const { hostId, xtoken, languageCode } = this.config;
    return {
      '@HostID': hostId,
      '@Xtoken': xtoken,
      '@Interface': 'WEB', // THIS IS THE DEFAULT VALUE FOR THE INTERFACE
      '@UserName': 'WEB', // THIS IS THE DEFAULT VALUE FOR THE USERNAME
      '@LanguageCode': languageCode,
    };
  }

  private wrapRequest<T>(body: T): WrapRequestDto<T> {
    return new WrapRequestDto({
      RqHeader: this.buildHeader(),
      Body: body,
    });
  }

  // Master Records
  async searchMasterRecord(
    payload: SearchMasterRecordRQ
  ): Promise<AvesResponseRoot<SearchMasterRecordRS>> {
    return this.http.postXml(
      '/interop/masterRecords/v2/rest/Search',
      'SearchMasterRecordRQ',
      this.wrapRequest(payload)
    );
  }

  async insertOrUpdateMasterRecord(
    payload: ManageMasterRecordRQ
  ): Promise<AvesResponseRoot<CustomerRecordRS>> {
    return this.http.postXml(
      '/interop/masterRecords/v2/rest/InsertOrUpdate',
      'ManageMasterRecordRQ',
      this.wrapRequest(payload)
    );
  }

  // Booking
  async createBookingFile(
    payload: BookFileRQ
  ): Promise<AvesResponseRoot<BookingFileRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/CreateBookingFile',
      'BookFileRQ',
      this.wrapRequest(payload)
    );
  }

  async modBookingFileHeader(
    payload: ModiFileHeaderRQ
  ): Promise<AvesResponseRoot<ModiFileHeaderRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/ModBookingFileHeader',
      'ModiFileHeaderRQ',
      this.wrapRequest(payload)
    );
  }

  async modBookingFileServices(
    payload: ModFileServicesRQ
  ): Promise<AvesResponseRoot<BookingFileRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/ModBookingFileServices',
      'ModFileServicesRQ',
      this.wrapRequest(payload)
    );
  }

  async setBookingFileStatus(
    payload: SetStatusRQ
  ): Promise<AvesResponseRoot<SetStatusServiceRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/SetBookingFileStatus',
      'SetStatusRQ',
      this.wrapRequest(payload)
    );
  }

  async cancelBookingFile(
    payload: CancelFileRQ
  ): Promise<AvesResponseRoot<CancelFileRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/CancelBookingFile',
      'CancelFileRQ',
      this.wrapRequest(payload)
    );
  }

  async insertFilePaymentList(
    payload: FilePaymentListRQ
  ): Promise<AvesResponseRoot<FilePaymentListRS>> {
    return this.http.postXml(
      '/interop/booking/v2/rest/InsertFilePaymentList',
      'FilePaymentListRQ',
      this.wrapRequest(payload)
    );
  }

  // Documents
  async printBookingDocument(
    payload: PrintBookingDocumentRQ
  ): Promise<AvesResponseRoot<PrintBookingDocumentRS>> {
    return this.http.postXml(
      '/interop/document/v2/rest/PrintBookingDocument',
      'PrintBookingDocumentRQ',
      this.wrapRequest(payload)
    );
  }
}
