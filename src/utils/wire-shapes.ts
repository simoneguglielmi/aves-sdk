/**
 * Per-shape wire rules: which camelCase fields are XML @attrs at this level.
 * Children are keyed by the camelCase property name on the parent object.
 * Always pass an explicit shape at request boundaries — missing shape ⇒ all elements.
 *
 * List fields (`*List: Item[]`) carry `listWrap` on the **item** shape. The wrap/encode
 * path synthesizes the Detail wrapper; `WireShapeFor<Item[]>` therefore matches the
 * item keys — no post-wrap escape hatch.
 */
export type WireShape = {
	attrs?: readonly string[];
	preserveCamel?: readonly string[];
	/**
	 * camelCase key → literal wire tag at this level. Beats the global KEY_OVERRIDES table.
	 * Threaded through `Pascalize<T, S>` so types mirror runtime.
	 */
	rename?: Readonly<Partial<Record<string, string>>>;
	/** camelCase field emitted as XML text content (`#text` for fast-xml-parser). */
	textContent?: string;
	/**
	 * Wrap an SDK `*List: Item[]` into AVES List/Detail form.
	 * `"many"` → `{ detailKey: items }` · `"one"` → `[{ detailKey: item }, …]`
	 * Detail key defaults to `*List` → `*Detail` (see `detailKeyFor`).
	 */
	listWrap?: "many" | "one";
	/** Override inferred Detail key (e.g. financialDeadlineList → deadlineDetail). */
	detailKey?: string;
	children?: { readonly [key: string]: WireShape | undefined };
};

type Item<T> = T extends readonly (infer U)[] ? U : T;
type ItemKeys<T> = T extends unknown ? keyof NonNullable<Item<T>> : never;
type ItemValue<T, K> = T extends unknown
	? K extends keyof NonNullable<Item<T>>
		? NonNullable<Item<T>>[K]
		: never
	: never;

export type WireShapeFor<T> = {
	attrs?: readonly (ItemKeys<T> & string)[];
	preserveCamel?: readonly (ItemKeys<T> & string)[];
	rename?: Partial<Record<ItemKeys<T> & string, string>>;
	textContent?: ItemKeys<T> & string;
	listWrap?: "many" | "one";
	detailKey?: string;
	children?: {
		[K in ItemKeys<T>]?: WireShapeFor<NonNullable<ItemValue<T, K>>>;
	};
};

/** Const-preserving WireShape constructor (replaces `as const satisfies WireShape`). */
export function wire<const S extends WireShape>(shape: S): S {
	return shape;
}

/** Attrs-only shape. */
export function attrsWire<const A extends readonly string[]>(...attrs: A) {
	return wire({ attrs });
}

/** Attrs that stay camelCase on the wire (`@sCode1`, not `@SCode1`). */
export function camelAttrsWire<const A extends readonly string[]>(...attrs: A) {
	return wire({ attrs, preserveCamel: attrs });
}

/** Attrs + a subset that stay camelCase (e.g. `pCode` among other Pascal attrs). */
export function attrsCamelWire<
	const A extends readonly string[],
	const P extends readonly A[number][],
>(attrs: A, preserveCamel: P) {
	return wire({ attrs, preserveCamel });
}

/** Children-only shape. */
export function childrenWire<
	const C extends { readonly [key: string]: WireShape | undefined },
>(children: C) {
	return wire({ children });
}

/** Attrs + children. */
export function nestWire<
	const A extends readonly string[],
	const C extends { readonly [key: string]: WireShape | undefined },
>(attrs: A, children: C) {
	return wire({ attrs, children });
}

/** Item shape + listWrap (and optional detailKey override). */
export function listWire<
	const S extends WireShape,
	const M extends "many" | "one",
>(item: S, listWrap: M, detailKey?: string) {
	return !detailKey
		? wire({ ...item, listWrap })
		: wire({ ...item, listWrap, detailKey });
}

/** `listWire(attrsWire(...), mode)` in one call. */
export function listAttrsWire<
	const M extends "many" | "one",
	const A extends readonly string[],
>(listWrap: M, ...attrs: A) {
	return listWire(attrsWire(...attrs), listWrap);
}

/** Both array-of-one and many wraps of the same item shape. */
export function listWireModes<const S extends WireShape>(item: S) {
	return {
		one: listWire(item, "one"),
		many: listWire(item, "many"),
	} as const;
}

// --- leaf / fragment shapes -------------------------------------------------

export const headerWire = attrsWire(
	"hostID",
	"xtoken",
	"interface",
	"userName",
	"status",
	"languageCode",
);

export const financialDetailWire = attrsWire(
	"currencyCode",
	"creditLimit",
	"c_PaymentType",
	"c_SpecPaymentTypeCode",
	"s_PaymentType",
	"s_SpecPaymentTypeCode",
	"enableElectronicInvoicing",
	"electronicInvoicingType",
);

export const idDocumentDetailWire = attrsWire(
	"idType",
	"idCode",
	"idIssueLocation",
	"idIssueCounty",
	"idIssueDate",
	"idExpireDate",
);

export const accountPoliciesWire = attrsWire(
	"acceptProfilingPolicies",
	"acceptPrivacyPolicies",
	"acceptNewsletterPolicies",
);

export const dynamicFieldsWire = attrsWire("key", "value");

export const supplierRefMasterRecordsWire = attrsWire(
	"supplierRefCode",
	"companyMainBusinessType",
	"carrierType",
);

export const masterRecordWire = nestWire(["recordCode", "insertCriteria"], {
	financialDetail: financialDetailWire,
	idDocumentDetail: idDocumentDetailWire,
	accountPolicies: accountPoliciesWire,
	dynamicFields: dynamicFieldsWire,
	supplierRefMasterRecords: supplierRefMasterRecordsWire,
});

const dateRangeWire = attrsWire("minDate", "maxDate");

/** Search master — recordCode stays element; date range uses attrs. */
export const searchMasterWire = childrenWire({
	lastModificationDate: dateRangeWire,
});

export const statisticCodesWire = camelAttrsWire(
	"sCode1",
	"sCode2",
	"sCode3",
	"sCode4",
	"sCode5",
	"sCode6",
);

export const destinationWire = attrsWire(
	"code",
	"iataCode",
	"nationCode",
	"type",
);

/** NoteDetail item shape — `text` → `#text` via global KEY_OVERRIDES. */
export const noteDetailWire = attrsWire("nType", "title");

const noteListWire = listWire(noteDetailWire, "many");

export const passengerDetailWire = nestWire(
	["rph", "roomRph", "billingHolder"],
	{
		notes: listWire(noteDetailWire, "many", "noteDetail"),
		idDocInfo: idDocumentDetailWire,
	},
);

export const serviceFareWire = attrsWire(
	"currencyCode",
	"exchangeRate",
	"cost",
	"costTax",
	"costType",
	"vatCostCurrencyCode",
	"price",
	"priceTax",
	"priceType",
);

export const selectedPackageDetailWire = attrsCamelWire(
	["pCode", "startDate", "endDate", "getServicesFromPackage"],
	["pCode"],
);

export const selectedServiceDetailWire = wire({
	...attrsCamelWire(["sCode", "ssCode"], ["sCode", "ssCode"]),
	children: {
		serviceFare: serviceFareWire,
		avesServiceInfo: childrenWire({ serviceFare: serviceFareWire }),
		noteList: noteListWire,
	},
});

const selectedServiceLists = listWireModes(selectedServiceDetailWire);
const passengerLists = listWireModes(passengerDetailWire);

export const passengerListWireOne = passengerLists.one;
export const passengerListWireMany = passengerLists.many;

const selectedPackageListWire = listWire(selectedPackageDetailWire, "many");

const deadlineListWire = listAttrsWire(
	"many",
	"deadlineCode",
	"description",
	"expireDate",
);

/** ModFileServices deadline rows use reschedulingCode, not deadlineCode. */
const modDeadlineListWire = listAttrsWire(
	"many",
	"reschedulingCode",
	"description",
	"expireDate",
);

const financialDeadlineListWire = listWire(
	attrsWire("reschedulingCode", "expireDate", "totalAmount"),
	"many",
	"deadlineDetail",
);

const paymentListWire = listWire(
	wire({
		...attrsWire(
			"paymentDate",
			"paymentNote",
			"amount",
			"paymentUser",
			"paymentType",
		),
		// AVES misspells this PaymentDetail attribute; SDK field stays `paymentNote`.
		rename: { paymentNote: "PaumentNote" },
	}),
	"many",
);

const filePaymentListWire = listAttrsWire(
	"many",
	"paymentDate",
	"paymentNote",
	"payerMasterCode",
	"payerName",
	"amount",
	"paymentType",
);

const cancellableBookedServiceListWire = listAttrsWire(
	"many",
	"cancelOperationType",
	"serviceRefType",
	"serviceRefValue",
);

const bookingFileDocumentWire = nestWire(["printDoc", "sendDocViaEmail"], {
	infoDocumentsToPrint: childrenWire({
		documentCustomizablePrintParameters: attrsWire(
			"makeDocumentTo",
			"fillInCode",
		),
	}),
});

const bookingFileStatusWire = attrsWire("value", "expiredDate");
const customerDetailWire = attrsWire("recordCode");
const bookingFinancialInfoWire = attrsWire(
	"customer_PaymentType",
	"customer_SpecPaymentTypeCode",
);

const packageParamsWire = attrsWire(
	"getAllDeptDate",
	"getFlightPlan",
	"getAllAccomodation",
	"getRealAvailability",
);

const topServiceParamsWire = attrsWire(
	"compatibleAccomodation",
	"alternativeAccomodation",
);

const featureListWire = listAttrsWire("many", "code", "name");
const fileStatusWire = attrsWire(
	"value",
	"expiredDate",
	"optionedFileExpireDatePolicy",
);
const penaltyWire = attrsWire("apply", "specificCode");

const bookingFileChildrenBase = {
	customerDetail: customerDetailWire,
	bookingFileStatus: bookingFileStatusWire,
	statisticCodes: statisticCodesWire,
	destination: destinationWire,
	bookingFileDocument: bookingFileDocumentWire,
	bookingFinancialInfo: bookingFinancialInfoWire,
	selectedPackageDetail: selectedPackageDetailWire,
	selectedPackageList: selectedPackageListWire,
	financialDeadlineList: financialDeadlineListWire,
	paymentList: paymentListWire,
	cancellableBookedServiceList: cancellableBookedServiceListWire,
	noteList: noteListWire,
} as const;

/** CreateBookingFile — array-of-one for selectedService / passenger / extraQuote lists. */
export const bookingFileWire = childrenWire({
	...bookingFileChildrenBase,
	deadlineList: deadlineListWire,
	selectedServiceList: selectedServiceLists.one,
	extraQuoteServiceList: selectedServiceLists.one,
	passengerList: passengerLists.one,
});

/** ModFileServices / ModFileHeader — many-style list wrap. */
export const modBookingFileWire = childrenWire({
	...bookingFileChildrenBase,
	deadlineList: modDeadlineListWire,
	selectedServiceList: selectedServiceLists.many,
	extraQuoteServiceList: selectedServiceLists.many,
	passengerList: passengerLists.many,
});

/** InsertFilePaymentList — root paymentUser is an @attr; detail fields nested. */
export const filePaymentListRequestWire = nestWire(["paymentUser"], {
	filePaymentList: filePaymentListWire,
});

/** SearchFileRQ — date ranges / insurance / status use attrs. */
export const searchFileWire = childrenWire({
	fileStatus: attrsWire("value", "expireDate"),
	startDate: dateRangeWire,
	createdDate: dateRangeWire,
	lastModificationDate: dateRangeWire,
	insurance: attrsWire("code", "number"),
});

/**
 * BookingDataExportRQ — code filters are element lists, not attribute lists.
 * The RQ table writes `@Status` / `@Code`, but the only worked example of this
 * family in the spec is `<FeatureCodeList><Code>HTL</Code></FeatureCodeList>`
 * (Booking.txt:2342-2344), so each entry is a bare `<Code>` / `<Status>` element.
 */
const codeListWire = listWire(wire({}), "many", "code");

export const exportBookingDataWire = childrenWire({
	startDate: dateRangeWire,
	endDate: dateRangeWire,
	createdDate: dateRangeWire,
	lastModificationDate: dateRangeWire,
	lastModificationDateTime: dateRangeWire,
	statusLists: listWire(wire({}), "many", "status"),
	featureCodeList: codeListWire,
	packageCodeList: codeListWire,
	limitRange: attrsWire("skip", "take"),
});

/** GetPackageDetail SelectedServiceDetail (ServiceCode + PackageRow). */
export const packagePrgServiceDetailWire = attrsWire(
	"serviceCode",
	"packageRow",
);

export const packageDetailRequestWire = childrenWire({
	statisticCodes: statisticCodesWire,
	selectedServiceList: listWire(packagePrgServiceDetailWire, "many"),
	passengerList: passengerLists.many,
});

/** BaseSearch fragment inside AvesSearchRQ (dates are elements). */
export const baseSearchWire = childrenWire({
	passengerList: passengerLists.many,
});

/** AvesSearchRQ body outside BaseSearch. */
export const avesSearchWire = childrenWire({
	destination: destinationWire,
	statisticCodes: statisticCodesWire,
	packageParams: packageParamsWire,
	topServiceParams: topServiceParamsWire,
	featureList: featureListWire,
});

export const setFileStatusWire = childrenWire({
	fileStatus: fileStatusWire,
	penalty: penaltyWire,
	bookingFileDocument: bookingFileDocumentWire,
});

/** Element-only request roots (CancelFile, SetFileServiceStatus, CommitPackage). */
export const elementOnlyWire = wire({});
