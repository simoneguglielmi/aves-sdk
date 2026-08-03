/**
 * Per-shape wire rules: which camelCase fields are XML @attrs at this level.
 * Children are keyed by the camelCase property name on the parent object.
 * Always pass an explicit shape at request boundaries — missing shape ⇒ all elements.
 */
export type WireShape = {
	attrs?: readonly string[];
	preserveCamel?: readonly string[];
	children?: Readonly<Record<string, WireShape>>;
};

export const headerWire = {
	attrs: [
		"hostID",
		"xtoken",
		"interface",
		"userName",
		"status",
		"languageCode",
	],
} as const satisfies WireShape;

export const financialDetailWire = {
	attrs: [
		"currencyCode",
		"creditLimit",
		"c_PaymentType",
		"c_SpecPaymentTypeCode",
		"s_PaymentType",
		"s_SpecPaymentTypeCode",
		"enableElectronicInvoicing",
		"electronicInvoicingType",
	],
} as const satisfies WireShape;

export const idDocumentDetailWire = {
	attrs: [
		"idType",
		"idCode",
		"idIssueLocation",
		"idIssueCounty",
		"idIssueDate",
		"idExpireDate",
	],
} as const satisfies WireShape;

export const accountPoliciesWire = {
	attrs: [
		"acceptProfilingPolicies",
		"acceptPrivacyPolicies",
		"acceptNewsletterPolicies",
	],
} as const satisfies WireShape;

export const dynamicFieldsWire = {
	attrs: ["key", "value"],
} as const satisfies WireShape;

export const supplierRefMasterRecordsWire = {
	attrs: ["supplierRefCode", "companyMainBusinessType", "carrierType"],
} as const satisfies WireShape;

export const masterRecordWire = {
	attrs: ["recordCode", "insertCriteria"],
	children: {
		financialDetail: financialDetailWire,
		idDocumentDetail: idDocumentDetailWire,
		accountPolicies: accountPoliciesWire,
		dynamicFields: dynamicFieldsWire,
		supplierRefMasterRecords: supplierRefMasterRecordsWire,
	},
} as const satisfies WireShape;

/** Search master — recordCode stays element; date range uses attrs. */
export const searchMasterWire = {
	children: {
		lastModificationDate: { attrs: ["minDate", "maxDate"] },
	},
} as const satisfies WireShape;

export const statisticCodesWire = {
	attrs: ["sCode1", "sCode2", "sCode3", "sCode4", "sCode5", "sCode6"],
	preserveCamel: ["sCode1", "sCode2", "sCode3", "sCode4", "sCode5", "sCode6"],
} as const satisfies WireShape;

export const destinationWire = {
	attrs: ["code", "iataCode", "nationCode", "type"],
} as const satisfies WireShape;

export const noteDetailWire = {
	attrs: ["nType", "title"],
} as const satisfies WireShape;

export const passengerDetailWire = {
	attrs: ["rph", "roomRph", "billingHolder"],
	children: {
		notes: { children: { noteDetail: noteDetailWire } },
		idDocInfo: idDocumentDetailWire,
	},
} as const satisfies WireShape;

export const serviceFareWire = {
	attrs: [
		"currencyCode",
		"exchangeRate",
		"cost",
		"costTax",
		"costType",
		"vatCostCurrencyCode",
		"price",
		"priceTax",
		"priceType",
	],
} as const satisfies WireShape;

export const selectedPackageDetailWire = {
	attrs: ["pCode", "startDate", "endDate", "getServicesFromPackage"],
	preserveCamel: ["pCode"],
} as const satisfies WireShape;

export const selectedServiceDetailWire = {
	attrs: [
		"sCode",
		"ssCode",
		"supplierMasterCode",
		"supplierName",
		"supplierMasterSearchField",
		"supplierFiscalCode",
	],
	preserveCamel: ["sCode", "ssCode"],
	children: {
		serviceFare: serviceFareWire,
		avesServiceInfo: {
			children: { serviceFare: serviceFareWire },
		},
		noteList: { children: { noteDetail: noteDetailWire } },
	},
} as const satisfies WireShape;

const selectedServiceListWire = {
	children: { selectedServiceDetail: selectedServiceDetailWire },
} as const satisfies WireShape;

export const passengerListWire = {
	children: { passengerDetail: passengerDetailWire },
} as const satisfies WireShape;

const selectedPackageListWire = {
	children: { selectedPackageDetail: selectedPackageDetailWire },
} as const satisfies WireShape;

const deadlineListWire = {
	children: {
		deadlineDetail: {
			attrs: ["deadlineCode", "description", "expireDate", "reschedulingCode"],
		},
	},
} as const satisfies WireShape;

const financialDeadlineListWire = {
	children: {
		deadlineDetail: {
			attrs: ["reschedulingCode", "expireDate", "totalAmount"],
		},
	},
} as const satisfies WireShape;

const paymentListWire = {
	children: {
		paymentDetail: {
			attrs: [
				"paymentDate",
				"paumentNote",
				"amount",
				"paymentUser",
				"paymentType",
			],
		},
	},
} as const satisfies WireShape;

const filePaymentListWire = {
	children: {
		filePaymentDetail: {
			attrs: [
				"paymentDate",
				"paymentNote",
				"payerMasterCode",
				"payerName",
				"amount",
				"paymentType",
			],
		},
	},
} as const satisfies WireShape;

const cancellableBookedServiceListWire = {
	children: {
		cancellableBookedServiceDetail: {
			attrs: ["cancelOperationType", "serviceRefType", "serviceRefValue"],
		},
	},
} as const satisfies WireShape;

const noteListWire = {
	children: { noteDetail: noteDetailWire },
} as const satisfies WireShape;

const bookingFileDocumentWire = {
	attrs: ["printDoc", "sendDocViaEmail"],
	children: {
		infoDocumentsToPrint: {
			children: {
				infoDocumentToPrint: {
					children: {
						documentCustomizablePrintParameters: {
							attrs: ["makeDocumentTo", "fillInCode"],
						},
					},
				},
			},
		},
	},
} as const satisfies WireShape;

const bookingFileStatusWire = {
	attrs: ["value", "expiredDate"],
} as const satisfies WireShape;

const customerDetailWire = {
	attrs: ["recordCode"],
} as const satisfies WireShape;

const bookingFinancialInfoWire = {
	attrs: ["customer_PaymentType", "customer_SpecPaymentTypeCode"],
} as const satisfies WireShape;

const packageParamsWire = {
	attrs: [
		"getAllDeptDate",
		"getFlightPlan",
		"getAllAccomodation",
		"getRealAvailability",
	],
} as const satisfies WireShape;

const topServiceParamsWire = {
	attrs: ["compatibleAccomodation", "alternativeAccomodation"],
} as const satisfies WireShape;

const featureListWire = {
	children: { featureDetail: { attrs: ["code", "name"] } },
} as const satisfies WireShape;

const fileStatusWire = {
	attrs: ["value", "expiredDate", "optionedFileExpireDatePolicy"],
} as const satisfies WireShape;

const penaltyWire = {
	attrs: ["apply", "specificCode"],
} as const satisfies WireShape;

/**
 * CreateBookingFile / ModFileServices / ModFileHeader after list-wrap.
 * Root startDate/endDate stay elements (not in attrs).
 */
export const bookingFileWire = {
	children: {
		customerDetail: customerDetailWire,
		bookingFileStatus: bookingFileStatusWire,
		statisticCodes: statisticCodesWire,
		destination: destinationWire,
		bookingFileDocument: bookingFileDocumentWire,
		bookingFinancialInfo: bookingFinancialInfoWire,
		selectedPackageDetail: selectedPackageDetailWire,
		selectedPackageList: selectedPackageListWire,
		selectedServiceList: selectedServiceListWire,
		extraQuoteServiceList: selectedServiceListWire,
		passengerList: passengerListWire,
		deadlineList: deadlineListWire,
		financialDeadlineList: financialDeadlineListWire,
		paymentList: paymentListWire,
		cancellableBookedServiceList: cancellableBookedServiceListWire,
		noteList: noteListWire,
	},
} as const satisfies WireShape;

/**
 * InsertFilePaymentList — root paymentUser is an @attr; detail fields nested.
 */
export const filePaymentListRequestWire = {
	attrs: ["paymentUser"],
	children: {
		filePaymentList: filePaymentListWire,
	},
} as const satisfies WireShape;

/** SearchFileRQ — date ranges / insurance / status use attrs. */
export const searchFileWire = {
	children: {
		fileStatus: { attrs: ["value", "expireDate"] },
		startDate: { attrs: ["minDate", "maxDate"] },
		createdDate: { attrs: ["minDate", "maxDate"] },
		lastModificationDate: { attrs: ["minDate", "maxDate"] },
		insurance: { attrs: ["code", "number"] },
	},
} as const satisfies WireShape;

/** GetPackageDetail SelectedServiceDetail (ServiceCode + PackageRow). */
export const packagePrgServiceDetailWire = {
	attrs: ["serviceCode", "packageRow"],
} as const satisfies WireShape;

export const packageDetailRequestWire = {
	children: {
		statisticCodes: statisticCodesWire,
		selectedServiceList: {
			children: { selectedServiceDetail: packagePrgServiceDetailWire },
		},
		passengerList: passengerListWire,
	},
} as const satisfies WireShape;

/** BaseSearch fragment inside AvesSearchRQ (dates are elements). */
export const baseSearchWire = {
	children: {
		passengerList: passengerListWire,
	},
} as const satisfies WireShape;

/** AvesSearchRQ body outside BaseSearch (after featureList wrap). */
export const avesSearchWire = {
	children: {
		destination: destinationWire,
		statisticCodes: statisticCodesWire,
		packageParams: packageParamsWire,
		topServiceParams: topServiceParamsWire,
		featureList: featureListWire,
	},
} as const satisfies WireShape;

export const setFileStatusWire = {
	children: {
		fileStatus: fileStatusWire,
		penalty: penaltyWire,
		bookingFileDocument: bookingFileDocumentWire,
	},
} as const satisfies WireShape;

/** Element-only request roots (CancelFile, SetFileServiceStatus, CommitPackage). */
export const elementOnlyWire = {} as const satisfies WireShape;
