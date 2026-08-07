import { Context } from "effect";
import type { MasterRecordsService } from "./types.js";

/** Effect service tag for master-records domain. */
export class AvesMaster extends Context.Tag("aves/Master")<
	AvesMaster,
	MasterRecordsService
>() {}
