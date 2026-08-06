/**
 * Inbound facade → AVES fragment maps (single source of truth for dual-key input).
 * Scoped by applying facadeObject / coalesceAliases on the schema that owns each
 * field — never as a global walker.
 */

export const bookingRefFacades = {
	customerCode: "customerRecordCode",
	bookingCode: "bookingFileCode",
	bookingReference: "bookingFileRefCode",
} as const;

export const noteFacades = {
	noteType: "nType",
} as const;

export const passengerFacades = {
	passengerRef: "rph",
	roomRef: "roomRph",
	gender: "sex",
	email: "eMail",
	identityDocument: "idDocInfo",
} as const;

export const bookingServiceFacades = {
	serviceCode: "sCode",
	subServiceCode: "ssCode",
	quantity: "qty",
	passengerCount: "pax",
	session: "avesSession",
	passengerRefs: "paxAssociated",
	serviceType: "avesServiceType",
	targetType: "toServiceType",
	notes: "noteList",
} as const;

export const selectedPackageFacades = {
	packageCode: "pCode",
	includeServices: "getServicesFromPackage",
} as const;

export const bookingRootFacades = {
	...bookingRefFacades,
	customer: "customerDetail",
	status: "bookingFileStatus",
	description: "bookingFileDescription",
	referenceName: "bookingFileReferenceName",
	financial: "bookingFinancialInfo",
	package: "selectedPackageDetail",
	packages: "selectedPackageList",
	services: "selectedServiceList",
	extraServices: "extraQuoteServiceList",
	passengers: "passengerList",
	payments: "paymentList",
	documents: "bookingFileDocument",
	deadlines: "deadlineList",
	financialDeadlines: "financialDeadlineList",
	notes: "noteList",
} as const;

export const modServicesFacades = {
	...bookingRefFacades,
	package: "selectedPackageDetail",
	packages: "selectedPackageList",
	services: "selectedServiceList",
	passengers: "passengerList",
	deadlines: "deadlineList",
	cancellableServices: "cancellableBookedServiceList",
} as const;

export const modHeaderFacades = {
	...bookingRefFacades,
	startDate: "bookingFileStartDate",
	newCustomerCode: "newCustomerRecordCode",
	referenceName: "bookingFileReferenceName",
	passengers: "passengerList",
	financial: "bookingFinancialInfo",
	financialDeadlines: "financialDeadlineList",
} as const;

export const setStatusFacades = {
	...bookingRefFacades,
	status: "fileStatus",
	documents: "bookingFileDocument",
} as const;

export const setServiceStatusFacades = {
	...bookingRefFacades,
	serviceReference: "bookingServiceRef",
	serviceStatus: "bookingFileServiceStatus",
	serviceStatusDate: "bookingFileServiceStatusDate",
} as const;

export const paymentListFacades = {
	...bookingRefFacades,
	payments: "filePaymentList",
} as const;

export const searchBookingFacades = {
	...bookingRefFacades,
	status: "fileStatus",
} as const;

export const masterRecordFacades = {
	financial: "financialDetail",
	identityDocument: "idDocumentDetail",
	policies: "accountPolicies",
	customFields: "dynamicFields",
	supplierReference: "supplierRefMasterRecords",
} as const;

export const avesSearchFacades = {
	...bookingRefFacades,
	searchType: "avesSearchType",
	passengers: "passengerList",
	packageOptions: "packageParams",
	serviceOptions: "topServiceParams",
	serviceOrPackageCode: "servOrPackCode",
	serviceOrPackageDescription: "servOrPackDesc",
	passengerCount: "paxQty",
	passengerCountRule: "paxQtyCriteria",
	features: "featureList",
	includeDocumentation: "getDocumentation",
	mergeBoardAndAccommodation: "mergeBoardAndAccomodation",
	discardUnavailable: "discartNotAvailables",
	discardUnavailableMinSales: "discartNotAvailablesMinSales",
	discardUnavailableDaysInOut: "discartNotAvailablesDaysInOut",
} as const;

export const packageParamsFacades = {
	allDepartureDates: "getAllDeptDate",
	allAccommodation: "getAllAccomodation",
	compatibleAccommodation: "compatibleAccomodation",
	alternativeAccommodation: "alternativeAccomodation",
} as const;

export const packageDetailFacades = {
	...bookingRefFacades,
	services: "selectedServiceList",
	passengers: "passengerList",
} as const;
