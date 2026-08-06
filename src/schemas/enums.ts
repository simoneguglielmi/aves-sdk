import { type EnumValue, enumSchema } from "../utils/enum.js";

// ---------------------------------------------------------------------------
// Shared / cross-domain
// ---------------------------------------------------------------------------

export const Gender = {
	M: "M",
	F: "F",
} as const;
export type Gender = EnumValue<typeof Gender>;
export const GenderSchema = enumSchema(Gender);

export const RsStatusValue = {
	OK: "OK",
	ERROR: "ERROR",
	WARNING: "WARNING",
	TIMEOUT: "TIMEOUT",
} as const;
export type RsStatusValue = EnumValue<typeof RsStatusValue>;
export const RsStatusValueSchema = enumSchema(RsStatusValue);

// ---------------------------------------------------------------------------
// Request envelope (RQ body nest keys)
// ---------------------------------------------------------------------------

/** Nest key when an op wraps the API body under a Detail element (vs spread at RQ root). */
export const OpBodyKey = {
	MasterRecordDetail: "MasterRecordDetail",
} as const;
export type OpBodyKey = EnumValue<typeof OpBodyKey>;
export const OpBodyKeySchema = enumSchema(OpBodyKey);

// ---------------------------------------------------------------------------
// Master records
// ---------------------------------------------------------------------------

export const SearchMasterType = {
	CODE: "CODE",
	NAME: "NAME",
	VATCODE: "VATCODE",
	ZONE: "ZONE",
	CATEGORY: "CATEGORY",
	EMAIL: "EMAIL",
	LASTMODDATE: "LASTMODDATE",
	SEARCH_FIELD: "SEARCH_FIELD",
	EXTERNAL_REF_CODE: "EXTERNAL_REF_CODE",
} as const;
export type SearchMasterType = EnumValue<typeof SearchMasterType>;
export const SearchMasterTypeSchema = enumSchema(SearchMasterType);

/** MasterRecord.txt:214-219 / Booking CPX.txt:1960-1964: CUSTOMER/SUPPLIER/VOUCHER/SUPPLIER_VOUCHER/GENERAL */
export const RecordType = {
	CUSTOMER: "CUSTOMER",
	SUPPLIER: "SUPPLIER",
	VOUCHER: "VOUCHER",
	SUPPLIER_VOUCHER: "SUPPLIER_VOUCHER",
	GENERAL: "GENERAL",
} as const;
export type RecordType = EnumValue<typeof RecordType>;
export const RecordTypeSchema = enumSchema(RecordType);

export const RecordStatus = {
	ENABLED: "ENABLED",
	DISABLED: "DISABLED",
	WARNING: "WARNING",
	BLACKLISTED: "BLACKLISTED",
} as const;
export type RecordStatus = EnumValue<typeof RecordStatus>;
export const RecordStatusSchema = enumSchema(RecordStatus);

/** Upsert insertCriteria: S always insert · N skip if exists · T update all · M secondary only */
export const InsertCriteria = {
	S: "S",
	N: "N",
	T: "T",
	M: "M",
} as const;
export type InsertCriteria = EnumValue<typeof InsertCriteria>;
export const InsertCriteriaSchema = enumSchema(InsertCriteria);

export const MasterPaymentType = {
	CASH: "CASH",
	BANK: "BANK",
	RID: "RID",
	RIBA: "RIBA",
	SPECIFIC_CODE: "SPECIFIC_CODE",
} as const;
export type MasterPaymentType = EnumValue<typeof MasterPaymentType>;
export const MasterPaymentTypeSchema = enumSchema(MasterPaymentType);

export const CarrierType = {
	NOT_SET: "NOT_SET",
	FLIGHT: "FLIGHT",
	SHIP: "SHIP",
	TRAIN: "TRAIN",
	RENTCAR: "RENTCAR",
	BUS: "BUS",
	DP_HOTEL: "DP_HOTEL",
	TO_HOTEL: "TO_HOTEL",
	TO_TOUR: "TO_TOUR",
	TO_HOTEL_AND_TOUR: "TO_HOTEL_AND_TOUR",
	DP_AUTO: "DP_AUTO",
	DP_GDS_NAVI: "DP_GDS_NAVI",
	DP_GDS_VOLI: "DP_GDS_VOLI",
	TOUR_OPERATOR: "TOUR_OPERATOR",
	TICKETING_EV: "TICKETING_EV",
	OTHER: "OTHER",
} as const;
export type CarrierType = EnumValue<typeof CarrierType>;
export const CarrierTypeSchema = enumSchema(CarrierType);

// ---------------------------------------------------------------------------
// Booking file / services
// ---------------------------------------------------------------------------

export const BookingFileStatus = {
	QUOTATION: "QUOTATION",
	WORK_IN_PROGRESS: "WORK_IN_PROGRESS",
	CONFIRMED: "CONFIRMED",
	OPTIONED: "OPTIONED",
	CANCELED: "CANCELED",
} as const;
export type BookingFileStatus = EnumValue<typeof BookingFileStatus>;
export const BookingFileStatusSchema = enumSchema(BookingFileStatus);

export const SetFileStatusValue = {
	...BookingFileStatus,
	NULLIFIED: "NULLIFIED",
} as const;
export type SetFileStatusValue = EnumValue<typeof SetFileStatusValue>;
export const SetFileStatusValueSchema = enumSchema(SetFileStatusValue);

/** BOOKEDFILE response aliases (includes non-canonical wire forms). */
export const BookingFileStatusWire = {
	QUOTATION: "QUOTATION",
	WORK_IN_PROGRESS: "WORK_IN_PROGRESS",
	CONFIRM: "CONFIRM",
	CONFIRMED: "CONFIRMED",
	OPTION: "OPTION",
	OPTIONED: "OPTIONED",
	REQUEST: "REQUEST",
	REQUESTED: "REQUESTED",
	NULLIFIED: "NULLIFIED",
	CANCELED: "CANCELED",
} as const;
export type BookingFileStatusWire = EnumValue<typeof BookingFileStatusWire>;
export const BookingFileStatusWireSchema = enumSchema(BookingFileStatusWire);

export const AvesServiceType = {
	TOP: "TOP",
	TOP_SS: "TOP_SS",
	ADV: "ADV",
	GRP: "GRP",
	OTHER: "OTHER",
} as const;
export type AvesServiceType = EnumValue<typeof AvesServiceType>;
export const AvesServiceTypeSchema = enumSchema(AvesServiceType);

/**
 * Booking.txt:575-589 documents 13 values; RESIDENCE and TOUR are undocumented
 * wire dialect seen in real SearchServicesRS examples (Booking.txt:3376, :4207).
 */
export const ToServiceType = {
	ACCOMODATION: "ACCOMODATION",
	TRANSPORT: "TRANSPORT",
	CHARTER: "CHARTER",
	TRANSFER: "TRANSFER",
	PULLMAN: "PULLMAN",
	FERRY: "FERRY",
	CRUISE: "CRUISE",
	INSURANCE: "INSURANCE",
	EXTRAFEE: "EXTRAFEE",
	PENALTY: "PENALTY",
	PROMO: "PROMO",
	OTHER: "OTHER",
	NOT_SET: "NOT_SET",
	RESIDENCE: "RESIDENCE",
	TOUR: "TOUR",
} as const;
export type ToServiceType = EnumValue<typeof ToServiceType>;
export const ToServiceTypeSchema = enumSchema(ToServiceType);

export const BookedServiceStatus = {
	REQUEST: "REQUEST",
	ALLOTMENT_REQUEST: "ALLOTMENT_REQUEST",
	CONFIRMED_REQUEST: "CONFIRMED_REQUEST",
	CONFIRMED_EXTRA_ALLOTMENT: "CONFIRMED_EXTRA_ALLOTMENT",
	WAITLISTED: "WAITLISTED",
	ALLOTMENT: "ALLOTMENT",
	REFUSED: "REFUSED",
	NULLIFIED: "NULLIFIED",
	CANCELED: "CANCELED",
	MESSAGE: "MESSAGE",
} as const;
export type BookedServiceStatus = EnumValue<typeof BookedServiceStatus>;
export const BookedServiceStatusSchema = enumSchema(BookedServiceStatus);

/** File payment list / booking paymentList type codes. */
export const PaymentType = {
	C: "C",
	B: "B",
	D: "D",
	T: "T",
	P: "P",
	R: "R",
	A: "A",
	H: "H",
	I: "I",
	J: "J",
	K: "K",
	L: "L",
	M: "M",
	N: "N",
	O: "O",
	Q: "Q",
	S: "S",
	U: "U",
	V: "V",
} as const;
export type PaymentType = EnumValue<typeof PaymentType>;
export const PaymentTypeSchema = enumSchema(PaymentType);

export const CustomerPaymentType = {
	CASH: "CASH",
	BANK: "BANK",
	RID: "RID",
	RIBA: "RIBA",
	SPECIFIC_CODE: "SPECIFIC_CODE",
	NOT_SET: "NOT_SET",
} as const;
export type CustomerPaymentType = EnumValue<typeof CustomerPaymentType>;
export const CustomerPaymentTypeSchema = enumSchema(CustomerPaymentType);

export const PassengerCategory = {
	AD: "AD",
	CH: "CH",
	IN: "IN",
	OV: "OV",
} as const;
export type PassengerCategory = EnumValue<typeof PassengerCategory>;
export const PassengerCategorySchema = enumSchema(PassengerCategory);

export const CancelOperationType = {
	NULLIFY: "NULLIFY",
	DELETE: "DELETE",
} as const;
export type CancelOperationType = EnumValue<typeof CancelOperationType>;
export const CancelOperationTypeSchema = enumSchema(CancelOperationType);

export const ServiceRefType = {
	RPH: "RPH",
	FILE: "FILE",
} as const;
export type ServiceRefType = EnumValue<typeof ServiceRefType>;
export const ServiceRefTypeSchema = enumSchema(ServiceRefType);

export const OptionedExpirePolicy = {
	NOT_SET: "NOT_SET",
	CONSIDER_HOLIDAY: "CONSIDER_HOLIDAY",
	CONSIDER_HOLIDAY_AND_SATURDAY: "CONSIDER_HOLIDAY_AND_SATURDAY",
} as const;
export type OptionedExpirePolicy = EnumValue<typeof OptionedExpirePolicy>;
export const OptionedExpirePolicySchema = enumSchema(OptionedExpirePolicy);

export const FilePaymentOperationType = {
	AbsoluteAmountsInsertion: "AbsoluteAmountsInsertion",
	FinalAmountToAchieve: "FinalAmountToAchieve",
	FinalAmountToAchieveWithoutControls: "FinalAmountToAchieveWithoutControls",
} as const;
export type FilePaymentOperationType = EnumValue<
	typeof FilePaymentOperationType
>;
export const FilePaymentOperationTypeSchema = enumSchema(
	FilePaymentOperationType,
);

export const DocumentType = {
	VISA_REQUEST: "VISA_REQUEST",
	TRAVEL_INFORMATION: "TRAVEL_INFORMATION",
	VOUCHER: "VOUCHER",
	BOOKING_CONTRACT: "BOOKING_CONTRACT",
	BOOKING_CONFIRMATION: "BOOKING_CONFIRMATION",
	SUPPLIER_SERVICE_LIST: "SUPPLIER_SERVICE_LIST",
	INVOICE: "INVOICE",
	PROFORMA_INVOICE: "PROFORMA_INVOICE",
	ADEGUAMENTO: "ADEGUAMENTO",
	RESERVATION_FORM: "RESERVATION_FORM",
	OPEN_XML: "OPEN_XML",
	SALES_INVOICE: "SALES_INVOICE",
	TICKETING_TMASTER: "TICKETING_TMASTER",
	SUMMARY_FORM: "SUMMARY_FORM",
} as const;
export type DocumentType = EnumValue<typeof DocumentType>;
export const DocumentTypeSchema = enumSchema(DocumentType);

export const MakeDocumentTo = {
	BOOKING_CUSTOMER: "BOOKING_CUSTOMER",
	FIRST_PASSENGER: "FIRST_PASSENGER",
} as const;
export type MakeDocumentTo = EnumValue<typeof MakeDocumentTo>;
export const MakeDocumentToSchema = enumSchema(MakeDocumentTo);

export const CostPriceType = {
	PAX_QTY_DAY: "PAX_QTY_DAY",
	PAX_QTY_NIGHT: "PAX_QTY_NIGHT",
	PAX_QTY_WEEK: "PAX_QTY_WEEK",
	PAX_QTY: "PAX_QTY",
	PAX_DAY: "PAX_DAY",
	PAX_NIGHT: "PAX_NIGHT",
	PAX_WEEK: "PAX_WEEK",
	PAX: "PAX",
	QTY_DAY: "QTY_DAY",
	QTY_NIGHT: "QTY_NIGHT",
	QTY_WEE: "QTY_WEE",
	QTY: "QTY",
	DAY: "DAY",
	NIGHT: "NIGHT",
	WEEK: "WEEK",
	FORFAIT: "FORFAIT",
} as const;
export type CostPriceType = EnumValue<typeof CostPriceType>;
export const CostPriceTypeSchema = enumSchema(CostPriceType);

export const GroupingPaxPolicy = {
	GROUPED_PAX: "GROUPED_PAX",
	NOT_GROUPED_PAX: "NOT_GROUPED_PAX",
	ONE_PAX_ONLY: "ONE_PAX_ONLY",
} as const;
export type GroupingPaxPolicy = EnumValue<typeof GroupingPaxPolicy>;
export const GroupingPaxPolicySchema = enumSchema(GroupingPaxPolicy);

export const TypeDownloadFile = {
	AVES2AVES: "AVES2AVES",
	AVES2AVESVIA: "AVES2AVESVIA",
	AVES2AVESITA: "AVES2AVESITA",
} as const;
export type TypeDownloadFile = EnumValue<typeof TypeDownloadFile>;
export const TypeDownloadFileSchema = enumSchema(TypeDownloadFile);

export const SearchBookingFileType = {
	FILE_CODE: "FILE_CODE",
	PAX_NAME: "PAX_NAME",
	PACKAGE_CODE: "PACKAGE_CODE",
	OTHER: "OTHER",
} as const;
export type SearchBookingFileType = EnumValue<typeof SearchBookingFileType>;
export const SearchBookingFileTypeSchema = enumSchema(SearchBookingFileType);

// ---------------------------------------------------------------------------
// Package / Program catalog
// ---------------------------------------------------------------------------

export const AvesSearchType = {
	SERVICE: "SERVICE",
	PROGRAM: "PROGRAM",
	PACKAGE: "PACKAGE",
} as const;
export type AvesSearchType = EnumValue<typeof AvesSearchType>;
export const AvesSearchTypeSchema = enumSchema(AvesSearchType);

export const PaxQtyCriteria = {
	GREATER_THAN: "GREATER_THAN",
	GREATER_OR_EQUAL: "GREATER_OR_EQUAL",
	EQUAL_TO: "EQUAL_TO",
	LESS_OR_EQUAL: "LESS_OR_EQUAL",
	LESS_THAN: "LESS_THAN",
} as const;
export type PaxQtyCriteria = EnumValue<typeof PaxQtyCriteria>;
export const PaxQtyCriteriaSchema = enumSchema(PaxQtyCriteria);

export const DestinationType = {
	CODE: "CODE",
	SUB_LOCALITY: "SUB_LOCALITY",
	LOCALITY: "LOCALITY",
	SUB_SUB_ISLAND: "SUB_SUB_ISLAND",
	SUB_ISLAND: "SUB_ISLAND",
	ISLAND_COUNTY: "ISLAND_COUNTY",
	SUB_ARCHIPELAGO: "SUB_ARCHIPELAGO",
	ARCHIPELAGO: "ARCHIPELAGO",
	REGION_STATE: "REGION_STATE",
	SUB_SUB_NATION: "SUB_SUB_NATION",
	SUB_NATION: "SUB_NATION",
	NATION: "NATION",
	SUB_SUB_CONTINENT: "SUB_SUB_CONTINENT",
	SUB_CONTINENT: "SUB_CONTINENT",
	CONTINENT: "CONTINENT",
} as const;
export type DestinationType = EnumValue<typeof DestinationType>;
export const DestinationTypeSchema = enumSchema(DestinationType);
