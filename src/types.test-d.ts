import { describe, expectTypeOf, it } from "vitest";
import type {
	AvesApiError,
	AvesClientApi,
	AvesError,
	AvesValidationError,
	DynamicFields,
	MasterRecordDetail,
	MasterRecordDetailResponse,
	RecordType,
	Result,
	RsStatus,
	RsStatusValue,
} from "./index.js";

// Pins 2.0 contracts: enum narrowing, honest AvesApiError, DynamicFields array,
// and MasterRecordDetailResponse server-only fields. Checked by `yarn test`
// (vitest typecheck) / `yarn test:types`; excluded from `yarn typecheck`.

describe("RsStatus (#1 — enumSchema collapses to string)", () => {
	it("rsStatus.status should be the RsStatusValue union, not string", () => {
		expectTypeOf<RsStatus["status"]>().toEqualTypeOf<RsStatusValue>();
	});
});

describe("AvesApiError (#3, #4 — status/code)", () => {
	it("code should be number | undefined, not number | string | undefined", () => {
		expectTypeOf<AvesApiError["code"]>().toEqualTypeOf<number | undefined>();
	});

	it("status should be RsStatusValue | undefined, not string | undefined", () => {
		expectTypeOf<AvesApiError["status"]>().toEqualTypeOf<
			RsStatusValue | undefined
		>();
	});
});

describe("MasterRecordDetail (#1, #2 — enum fields accept garbage strings)", () => {
	it("recordType should narrow to RecordType, not string", () => {
		expectTypeOf<MasterRecordDetail["recordType"]>().toEqualTypeOf<
			RecordType | undefined
		>();
	});

	// `@ts-expect-error` suppresses only the *next* line, and an object-literal
	// property error is reported at the property — so the directive belongs on the
	// offending property, not above the declaration. Placed above the declaration
	// it fires twice: "unused directive" plus the error it failed to suppress.
	it("rejects a garbage recordType value", () => {
		const _bad: MasterRecordDetail = {
			languageCode: "01",
			// @ts-expect-error garbage enum values must not compile (#1, #2)
			recordType: "CUTSOMER",
		};
	});

	it("rejects a garbage gender value", () => {
		const _badGender: MasterRecordDetail = {
			languageCode: "01",
			// @ts-expect-error garbage Gender value must not compile (#1)
			gender: "Q",
		};
	});

	it("rejects a garbage insertCriteria value", () => {
		const _badInsertCriteria: MasterRecordDetail = {
			languageCode: "01",
			// @ts-expect-error garbage InsertCriteria value must not compile (#1)
			insertCriteria: "ZZZ",
		};
	});
});

describe("DynamicFields (#12 — array export vs. singular field)", () => {
	it("dynamicFields should be an array of DynamicFields, matching the exported type", () => {
		expectTypeOf<MasterRecordDetail["dynamicFields"]>().toEqualTypeOf<
			DynamicFields[] | undefined
		>();
	});
});

describe("MasterRecordDetailResponse (#11 — response schema parses the wrong shape)", () => {
	it("has modifiedDate, a server-only field its own JSDoc promises", () => {
		expectTypeOf<MasterRecordDetailResponse>().toHaveProperty("modifiedDate");
	});

	it("has loginType, a server-only field its own JSDoc promises", () => {
		expectTypeOf<MasterRecordDetailResponse>().toHaveProperty("loginType");
	});
});

describe("SearchMasterRecordRS — flat array, no rsStatus on success", () => {
	it("is MasterRecordDetailResponse[]", () => {
		expectTypeOf<import("./index.js").SearchMasterRecordRS>().toEqualTypeOf<
			MasterRecordDetailResponse[]
		>();
	});

	it("does not expose rsStatus on the success payload", () => {
		expectTypeOf<
			import("./index.js").SearchMasterRecordRS
		>().not.toHaveProperty("rsStatus");
	});
});

describe("AvesError union", () => {
	it("includes kind on every variant", () => {
		expectTypeOf<AvesError["kind"]>().toEqualTypeOf<
			"validation" | "api" | "unknown"
		>();
	});

	it("narrows validation tag", () => {
		expectTypeOf<
			AvesValidationError["_tag"]
		>().toEqualTypeOf<"AvesValidationError">();
	});
});

describe("Result export", () => {
	it("success/failure shape", () => {
		expectTypeOf<Result<number, AvesError>>().toEqualTypeOf<
			{ success: true; data: number } | { success: false; error: AvesError }
		>();
	});
});

describe("AvesClientApi Promise facade", () => {
	it("exposes domains without transport", () => {
		expectTypeOf<AvesClientApi>().toHaveProperty("master");
		expectTypeOf<AvesClientApi>().toHaveProperty("booking");
		expectTypeOf<AvesClientApi>().toHaveProperty("packages");
		expectTypeOf<AvesClientApi>().not.toHaveProperty("transport");
	});
});
