import { Context } from "effect";
import type { AvesHttpService } from "./types.js";

/** Effect service tag for AVES XML POST (library Tag — no assumed Default). */
export class AvesHttp extends Context.Tag("aves/Http")<
	AvesHttp,
	AvesHttpService
>() {}
