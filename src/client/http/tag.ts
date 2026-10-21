import { Context } from "effect";
import type { AvesHttpService } from "./types.js";

/** Effect service for AVES XML POST (library service — no assumed layer). */
export class AvesHttp extends Context.Service<AvesHttp, AvesHttpService>()(
	"aves/Http",
) {}
