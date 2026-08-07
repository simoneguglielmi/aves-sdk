import { Effect } from "effect";
import { isSpecialObject } from "./case-transform.js";
import type { Result } from "./result.js";

/**
 * User-facing names for AVES-specific response properties (compat window).
 * Inbound dual keys live on Valibot schemas via {@link facadeObject}.
 */
export const publicKeyAliases = {
	rsStatus: "response",
	customerRecordCode: "customerCode",
	bookingFileCode: "bookingCode",
	bookingFileRefCode: "bookingReference",
	bookingFileStatus: "status",
	bookingFileDescription: "description",
	bookingFileStartDate: "startDate",
	bookingFileReferenceName: "referenceName",
	bookingFileServiceStatus: "serviceStatus",
	bookingFileServiceStatusDate: "serviceStatusDate",
	bookingServiceRef: "serviceReference",
	newCustomerRecordCode: "newCustomerCode",
	customerDetail: "customer",
	bookingFileDocument: "documents",
	bookingFinancialInfo: "financial",
	financialDetail: "financial",
	idDocumentDetail: "identityDocument",
	idDocInfo: "identityDocument",
	accountPolicies: "policies",
	dynamicFields: "customFields",
	supplierRefMasterRecords: "supplierReference",
	selectedPackageDetail: "package",
	selectedPackageList: "packages",
	selectedServiceList: "services",
	extraQuoteServiceList: "extraServices",
	passengerList: "passengers",
	noteList: "notes",
	deadlineList: "deadlines",
	financialDeadlineList: "financialDeadlines",
	paymentList: "payments",
	filePaymentList: "payments",
	cancellableBookedServiceList: "cancellableServices",
	bookedServiceList: "services",
	bookedServices: "services",
	serviceList: "services",
	bookingFileList: "bookings",
	amountsDetail: "amounts",
	bookedFileAmounts: "totals",
	subServiceList: "subServices",
	featureList: "features",
	packageList: "packages",
	pCode: "packageCode",
	sCode: "serviceCode",
	ssCode: "subServiceCode",
	rph: "passengerRef",
	roomRph: "roomRef",
	avesSession: "session",
	paxAssociated: "passengerRefs",
	paxQty: "passengerCount",
	paxQtyCriteria: "passengerCountRule",
	qty: "quantity",
	pax: "passengerCount",
	eMail: "email",
	sex: "gender",
	nType: "noteType",
	avesServiceType: "serviceType",
	toServiceType: "targetType",
	packageParams: "packageOptions",
	topServiceParams: "serviceOptions",
	servOrPackCode: "serviceOrPackageCode",
	servOrPackDesc: "serviceOrPackageDescription",
	getDocumentation: "includeDocumentation",
	getServicesFromPackage: "includeServices",
	mergeBoardAndAccomodation: "mergeBoardAndAccommodation",
	discartNotAvailables: "discardUnavailable",
	discartNotAvailablesMinSales: "discardUnavailableMinSales",
	discartNotAvailablesDaysInOut: "discardUnavailableDaysInOut",
	getAllDeptDate: "allDepartureDates",
	getAllAccomodation: "allAccommodation",
	compatibleAccomodation: "compatibleAccommodation",
	alternativeAccomodation: "alternativeAccommodation",
	fileStatus: "status",
} as const;

type PublicKeyAliases = typeof publicKeyAliases;

/** Recursively projects the public aliases onto a schema-derived type. */
export type Publicize<T> = T extends readonly (infer U)[]
	? Publicize<U>[]
	: T extends object
		? {
				[K in keyof T as K extends keyof PublicKeyAliases
					? PublicKeyAliases[K]
					: K]: Publicize<T[K]>;
			}
		: T;

/** Accept both facade names and AVES-shaped names (schema coalesce). */
export type FacadeInput<T> = T | Publicize<T>;

/** Return both names during the compatibility window. */
export type FacadeOutput<T> = T & Publicize<T>;

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

/** Public facade name → AVES keys that map to it (order = publicKeyAliases). */
const aliasToAvesKeys: Record<string, string[]> = {};
for (const [aves, pub] of Object.entries(publicKeyAliases)) {
	if (!aliasToAvesKeys[pub]) aliasToAvesKeys[pub] = [];
	aliasToAvesKeys[pub].push(aves);
}

/** One Proxy per target — stable identity, GC-friendly, circular-safe. */
const proxyCache = new WeakMap<object, object>();

function isDangerousKey(key: string | symbol): boolean {
	return typeof key === "string" && DANGEROUS_KEYS.has(key);
}

/**
 * Resolve a property for a target: own keys win; else first alias whose AVES
 * key exists on the target (handles services/status collisions).
 */
function resolveProp(target: object, prop: string | symbol): string | symbol {
	if (typeof prop !== "string") return prop;
	if (Reflect.has(target, prop)) return prop;
	const candidates = aliasToAvesKeys[prop];
	if (!candidates) return prop;
	for (const aves of candidates) {
		if (Reflect.has(target, aves)) return aves;
	}
	return candidates[0] ?? prop;
}

function wrapValue(value: unknown): unknown {
	if (value === null || typeof value !== "object") return value;
	if (isSpecialObject(value)) return value;
	const cached = proxyCache.get(value);
	if (cached) return cached;
	return Array.isArray(value) ? wrapArray(value) : wrapObject(value);
}

function wrapArray(target: unknown[]): unknown[] {
	const proxy = new Proxy(target, {
		get(t, prop, receiver) {
			if (prop === "length") return t.length;
			if (typeof prop === "string" && /^\d+$/.test(prop)) {
				const index = Number(prop);
				if (index < 0 || index >= t.length) return;
				return wrapValue(t[index]);
			}
			/**
			 * Array methods are returned unbound so they run with `this` set to the
			 * proxy. Binding them to `t` would make `for…of`, destructuring, `map`
			 * and friends read elements straight off the target, handing back rows
			 * without their public aliases.
			 */
			return Reflect.get(t, prop, receiver);
		},
		set(t, prop, value, receiver) {
			if (isDangerousKey(prop)) return false;
			return Reflect.set(t, prop, value, receiver);
		},
		defineProperty(t, prop, desc) {
			if (isDangerousKey(prop)) return false;
			return Reflect.defineProperty(t, prop, desc);
		},
		deleteProperty(t, prop) {
			if (isDangerousKey(prop)) return false;
			return Reflect.deleteProperty(t, prop);
		},
		setPrototypeOf() {
			return false;
		},
	});
	proxyCache.set(target, proxy);
	return proxy;
}

function wrapObject(target: object): object {
	const proxy = new Proxy(target, {
		get(t, prop, receiver) {
			const key = resolveProp(t, prop);
			return wrapValue(Reflect.get(t, key, receiver));
		},
		set(t, prop, value, receiver) {
			if (isDangerousKey(prop)) return false;
			return Reflect.set(t, resolveProp(t, prop), value, receiver);
		},
		has(t, prop) {
			if (typeof prop === "string" && !Reflect.has(t, prop)) {
				const candidates = aliasToAvesKeys[prop];
				if (candidates?.some((aves) => Reflect.has(t, aves))) return true;
			}
			return Reflect.has(t, resolveProp(t, prop));
		},
		ownKeys(t) {
			const keys = Reflect.ownKeys(t);
			const seen = new Set(keys);
			const extra: string[] = [];
			for (const key of keys) {
				if (typeof key !== "string") continue;
				const pub = publicKeyAliases[key as keyof PublicKeyAliases];
				if (pub && !seen.has(pub)) {
					seen.add(pub);
					extra.push(pub);
				}
			}
			return [...keys, ...extra];
		},
		getOwnPropertyDescriptor(t, prop) {
			const key = resolveProp(t, prop);
			const desc = Reflect.getOwnPropertyDescriptor(t, key);
			if (!desc) return;
			if (key !== prop) {
				return {
					configurable: true,
					enumerable: true,
					writable: true,
					value: wrapValue("value" in desc ? desc.value : Reflect.get(t, key)),
				};
			}
			if ("value" in desc) return { ...desc, value: wrapValue(desc.value) };
			return desc;
		},
		defineProperty(t, prop, desc) {
			if (isDangerousKey(prop)) return false;
			return Reflect.defineProperty(t, resolveProp(t, prop), desc);
		},
		deleteProperty(t, prop) {
			if (isDangerousKey(prop)) return false;
			return Reflect.deleteProperty(t, resolveProp(t, prop));
		},
		getPrototypeOf(t) {
			return Reflect.getPrototypeOf(t);
		},
		setPrototypeOf() {
			return false;
		},
	});
	proxyCache.set(target, proxy);
	return proxy;
}

/**
 * Zero-copy facade: lazy Proxy exposing AVES keys and public aliases.
 * Stable identity via WeakMap; hardened against prototype pollution.
 */
export function withPublicAliases<T>(value: T): FacadeOutput<T> {
	return wrapValue(value) as FacadeOutput<T>;
}

export function toFacadeResult<T, E extends Error>(
	result: Result<T, E>,
): Result<FacadeOutput<T>, E> {
	return result.success
		? { success: true, data: withPublicAliases(result.data) }
		: result;
}

/** Map success values through {@link withPublicAliases} (Effect path). */
export function toFacadeEffect<A, E>(
	effect: Effect.Effect<A, E>,
): Effect.Effect<FacadeOutput<A>, E> {
	return Effect.map(effect, withPublicAliases);
}

/**
 * Wrap an Effect-returning method so success values get public aliases.
 * Composable with domain `ops.*` bindings.
 */
export function facadeMethod<Args extends readonly unknown[], A, E>(
	fn: (...args: Args) => Effect.Effect<A, E>,
): (...args: Args) => Effect.Effect<FacadeOutput<A>, E> {
	return (...args) => toFacadeEffect(fn(...args));
}

