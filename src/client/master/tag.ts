import { Context } from "effect";
import type { MasterRecordsService } from "./service.js";

/** Effect service for master-records domain. */
export class AvesMaster extends Context.Service<
	AvesMaster,
	MasterRecordsService
>()("aves/Master") {}
