import { Inject, Injectable } from '@nestjs/common';
import { AVES_SDK_CONFIG } from '../tokens';
import type {
  AvesSdkConfig,
  AvesResponseRoot,
  RqHeader,
} from '../types/common';
import type { IXmlHttpClient } from '../http/xml-http-client';
import { XML_HTTP_CLIENT } from '../tokens';
import { RootElementNames } from '../config/root-elements';
import { AvesEndpoints } from '../config/endpoints';
import type {
  SearchCustomerRequest,
  CreateBookingRequest,
  CancelBookingRequest,
  PrintDocumentRequest,
  AddPaymentRequest,
  Customer,
  BookingResponse,
  CustomerSearchResult,
  DocumentPrintResult,
  OperationResponse,
  BookingStatusType,
  BookingService,
  CancelResponseData,
  PaymentResponseData,
  BookingStatusTypeValue,
} from '../validation/api-schemas';
import {
  searchCustomerRequestSchema,
  createBookingRequestSchema,
  cancelBookingRequestSchema,
  printDocumentRequestSchema,
  addPaymentRequestSchema,
  customerSchema,
} from '../validation/api-schemas';
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
  SetStatusServiceRQ,
  SetStatusServiceRS,
  CancelFileRQ,
  CancelFileRS,
  FilePaymentListRQ,
  FilePaymentListRS,
  PrintBookingDocumentRQ,
  PrintBookingDocumentRS,
} from '../types/interfaces';
import { WrapRequestDto } from './dto/wrap-request.dto';
import {
  mapSearchCustomerToXml,
  mapCreateBookingToXml,
  mapCancelBookingToXml,
  mapPrintDocumentToXml,
  mapAddPaymentToXml,
  mapCreateCustomerToXml,
  mapUpdateCustomerToXml,
  mapUpdateBookingHeaderToXml,
  mapUpdateBookingServicesToXml,
  mapSetBookingStatusToXml,
  mapSetBookingServiceStatusToXml,
  mapUpsertCustomerToXml,
} from '../mappers/request-mappers';
import {
  mapSearchResponseFromXml,
  mapCustomerResponseFromXml,
  mapBookingResponseFromXml,
  mapDocumentResponseFromXml,
  mapCancelResponseFromXml,
  mapPaymentResponseFromXml,
} from '../mappers/response-mappers';

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
      '@Interface': 'WEB', // default
      '@UserName': 'WEB', // default
      '@LanguageCode': languageCode,
    };
  }

  private wrapRequest<T>(body: T): WrapRequestDto<T> {
    return new WrapRequestDto({
      RqHeader: this.buildHeader(),
      Body: body,
    });
  }

  // ===== CUSTOMER MANAGEMENT =====

  /**
   * Search for customers
   */
  async searchCustomers(
    request: SearchCustomerRequest
  ): Promise<CustomerSearchResult> {
    const validatedRequest = searchCustomerRequestSchema.parse(request);

    const xmlRequest = mapSearchCustomerToXml(validatedRequest);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<SearchMasterRecordRQ>,
      AvesResponseRoot<SearchMasterRecordRS>
    >(
      AvesEndpoints.SEARCH_MASTER_RECORDS,
      RootElementNames.SEARCH_MASTER_RECORD,
      this.wrapRequest(xmlRequest)
    );
    return mapSearchResponseFromXml(
      xmlResponse.Response.Body,
      validatedRequest.pagination
    );
  }

  /**
   * Create a new customer
   */
  async createCustomer(
    customer: Customer
  ): Promise<OperationResponse<Customer>> {
    const validatedCustomer = customerSchema.parse(customer);

    const xmlRequest = mapCreateCustomerToXml(validatedCustomer);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<ManageMasterRecordRQ>,
      AvesResponseRoot<CustomerRecordRS>
    >(
      AvesEndpoints.INSERT_OR_UPDATE_MASTER_RECORD,
      RootElementNames.MANAGE_MASTER_RECORD,
      this.wrapRequest(xmlRequest)
    );
    return mapCustomerResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(
    customer: Customer
  ): Promise<OperationResponse<Customer>> {
    const validatedCustomer = customerSchema.parse(customer);

    const xmlRequest = mapUpdateCustomerToXml(validatedCustomer);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<ManageMasterRecordRQ>,
      AvesResponseRoot<CustomerRecordRS>
    >(
      AvesEndpoints.INSERT_OR_UPDATE_MASTER_RECORD,
      RootElementNames.MANAGE_MASTER_RECORD,
      this.wrapRequest(xmlRequest)
    );
    return mapCustomerResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Upsert a customer
   */
  async upsertCustomer(
    customer: Customer
  ): Promise<OperationResponse<Customer>> {
    // Validate customer data
    const validatedCustomer = customerSchema.parse(customer);

    const xmlRequest = mapUpsertCustomerToXml(validatedCustomer);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<ManageMasterRecordRQ>,
      AvesResponseRoot<CustomerRecordRS>
    >(
      AvesEndpoints.INSERT_OR_UPDATE_MASTER_RECORD,
      RootElementNames.MANAGE_MASTER_RECORD,
      this.wrapRequest(xmlRequest)
    );
    return mapCustomerResponseFromXml(xmlResponse.Response.Body);
  }

  // ===== BOOKING MANAGEMENT =====

  /**
   * Create a new booking
   */
  async createBooking(
    request: CreateBookingRequest
  ): Promise<OperationResponse<BookingResponse>> {
    const validatedRequest = createBookingRequestSchema.parse(request);

    const xmlRequest = mapCreateBookingToXml(validatedRequest);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<BookFileRQ>,
      AvesResponseRoot<BookingFileRS>
    >(
      AvesEndpoints.CREATE_BOOKING_FILE,
      RootElementNames.BOOK_FILE,
      this.wrapRequest(xmlRequest)
    );
    return mapBookingResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Update booking header information
   */
  async updateBookingHeader(
    customerRecordCode: string,
    bookingFileCode: string,
    bookingFileStartDate: string,
    updates?: {
      newCustomerRecordCode?: string;
      passengers?: any[];
      notes?: string;
    }
  ): Promise<OperationResponse<void>> {
    const xmlRequest = mapUpdateBookingHeaderToXml(
      customerRecordCode,
      bookingFileCode,
      bookingFileStartDate,
      updates
    );
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<ModiFileHeaderRQ>,
      AvesResponseRoot<ModiFileHeaderRS>
    >(
      AvesEndpoints.MOD_BOOKING_FILE_HEADER,
      RootElementNames.MODI_FILE_HEADER,
      this.wrapRequest(xmlRequest)
    );
    return {
      success: xmlResponse.Response.RsStatus['@Status'] === 'OK',
      message: xmlResponse.Response.RsStatus.ErrorDescription,
    };
  }

  /**
   * Update booking services
   */
  async updateBookingServices(
    customerRecordCode: string,
    bookingFileCode: string,
    services: BookingService[]
  ): Promise<OperationResponse<BookingResponse>> {
    const xmlRequest = mapUpdateBookingServicesToXml(
      customerRecordCode,
      bookingFileCode,
      services
    );
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<ModFileServicesRQ>,
      AvesResponseRoot<BookingFileRS>
    >(
      AvesEndpoints.MOD_BOOKING_FILE_SERVICES,
      RootElementNames.MOD_FILE_SERVICES,
      this.wrapRequest(xmlRequest)
    );
    return mapBookingResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Set booking status
   */
  async setBookingStatus(
    customerRecordCode: string,
    bookingFileCode: string,
    status: BookingStatusTypeValue,
    options?: {
      expiredDate?: string;
      optionedFileExpireDatePolicy?:
        | 'NOT_SET'
        | 'CONSIDER_HOLIDAY'
        | 'CONSIDER_HOLIDAY_AND_SATURDAY';
      backOfficeRequest?: boolean;
      printDoc?: boolean;
      sendDocViaEmail?: boolean;
      applyPenalty?: boolean;
      penaltyCode?: string;
      simulateCancelAndGetPenalty?: boolean;
    }
  ): Promise<OperationResponse<BookingResponse>> {
    const xmlRequest = mapSetBookingStatusToXml(
      customerRecordCode,
      bookingFileCode,
      status,
      options
    );
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<SetStatusRQ>,
      AvesResponseRoot<SetStatusServiceRS>
    >(
      AvesEndpoints.SET_BOOKING_FILE_STATUS,
      RootElementNames.SET_STATUS,
      this.wrapRequest(xmlRequest)
    );
    return mapBookingResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Set booking service status (nullify a specific service)
   */
  async setBookingServiceStatus(
    customerRecordCode: string,
    bookingFileCode: string,
    serviceRef: string,
    statusDate?: string
  ): Promise<OperationResponse<BookingResponse>> {
    const xmlRequest = mapSetBookingServiceStatusToXml(
      customerRecordCode,
      bookingFileCode,
      serviceRef,
      statusDate
    );
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<SetStatusServiceRQ>,
      AvesResponseRoot<SetStatusServiceRS>
    >(
      AvesEndpoints.SET_BOOKING_FILE_SERVICE_STATUS,
      RootElementNames.SET_STATUS_SERVICE,
      this.wrapRequest(xmlRequest)
    );
    return mapBookingResponseFromXml(xmlResponse.Response.Body);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    request: CancelBookingRequest
  ): Promise<OperationResponse<CancelResponseData>> {
    const validatedRequest = cancelBookingRequestSchema.parse(request);

    const xmlRequest = mapCancelBookingToXml(validatedRequest);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<CancelFileRQ>,
      AvesResponseRoot<CancelFileRS>
    >(
      AvesEndpoints.CANCEL_BOOKING_FILE,
      RootElementNames.CANCEL_FILE,
      this.wrapRequest(xmlRequest)
    );
    return mapCancelResponseFromXml(xmlResponse.Response.Body);
  }

  // ===== PAYMENT MANAGEMENT =====

  /**
   * Add payment to a booking
   */
  async addPayment(
    request: AddPaymentRequest
  ): Promise<OperationResponse<PaymentResponseData>> {
    const validatedRequest = addPaymentRequestSchema.parse(request);

    const xmlRequest = mapAddPaymentToXml(validatedRequest);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<FilePaymentListRQ>,
      AvesResponseRoot<FilePaymentListRS>
    >(
      AvesEndpoints.INSERT_FILE_PAYMENT_LIST,
      RootElementNames.FILE_PAYMENT_LIST,
      this.wrapRequest(xmlRequest)
    );
    return mapPaymentResponseFromXml(xmlResponse.Response.Body);
  }

  // ===== DOCUMENT MANAGEMENT =====

  /**
   * Generate and print booking documents
   */
  async printDocument(
    request: PrintDocumentRequest
  ): Promise<OperationResponse<DocumentPrintResult>> {
    const validatedRequest = printDocumentRequestSchema.parse(request);

    const xmlRequest = mapPrintDocumentToXml(validatedRequest);
    const xmlResponse = await this.http.postXml<
      WrapRequestDto<PrintBookingDocumentRQ>,
      AvesResponseRoot<PrintBookingDocumentRS>
    >(
      AvesEndpoints.PRINT_BOOKING_DOCUMENT,
      RootElementNames.PRINT_BOOKING_DOCUMENT,
      this.wrapRequest(xmlRequest)
    );
    return mapDocumentResponseFromXml(xmlResponse.Response.Body);
  }

  // ===== LEGACY METHODS (for backward compatibility) =====

  /**
   * @deprecated Use searchCustomers instead
   */
  async searchMasterRecord(
    payload: SearchMasterRecordRQ
  ): Promise<AvesResponseRoot<SearchMasterRecordRS>> {
    return this.http.postXml<
      WrapRequestDto<SearchMasterRecordRQ>,
      AvesResponseRoot<SearchMasterRecordRS>
    >(
      AvesEndpoints.SEARCH_MASTER_RECORDS,
      RootElementNames.SEARCH_MASTER_RECORD,
      this.wrapRequest(payload)
    );
  }

  /**
   * @deprecated Use createCustomer or updateCustomer instead
   */
  async insertOrUpdateMasterRecord(
    payload: ManageMasterRecordRQ
  ): Promise<AvesResponseRoot<CustomerRecordRS>> {
    return this.http.postXml<
      WrapRequestDto<ManageMasterRecordRQ>,
      AvesResponseRoot<CustomerRecordRS>
    >(
      AvesEndpoints.INSERT_OR_UPDATE_MASTER_RECORD,
      RootElementNames.MANAGE_MASTER_RECORD,
      this.wrapRequest(payload)
    );
  }

  /**
   * @deprecated Use createBooking instead
   */
  async createBookingFile(
    payload: BookFileRQ
  ): Promise<AvesResponseRoot<BookingFileRS>> {
    return this.http.postXml<
      WrapRequestDto<BookFileRQ>,
      AvesResponseRoot<BookingFileRS>
    >(
      AvesEndpoints.CREATE_BOOKING_FILE,
      RootElementNames.BOOK_FILE,
      this.wrapRequest(payload)
    );
  }

  /**
   * @deprecated Use cancelBooking instead
   */
  async cancelBookingFile(
    payload: CancelFileRQ
  ): Promise<AvesResponseRoot<CancelFileRS>> {
    return this.http.postXml<
      WrapRequestDto<CancelFileRQ>,
      AvesResponseRoot<CancelFileRS>
    >(
      AvesEndpoints.CANCEL_BOOKING_FILE,
      RootElementNames.CANCEL_FILE,
      this.wrapRequest(payload)
    );
  }

  /**
   * @deprecated Use printDocument instead
   */
  async printBookingDocument(
    payload: PrintBookingDocumentRQ
  ): Promise<AvesResponseRoot<PrintBookingDocumentRS>> {
    return this.http.postXml<
      WrapRequestDto<PrintBookingDocumentRQ>,
      AvesResponseRoot<PrintBookingDocumentRS>
    >(
      AvesEndpoints.PRINT_BOOKING_DOCUMENT,
      RootElementNames.PRINT_BOOKING_DOCUMENT,
      this.wrapRequest(payload)
    );
  }
}
