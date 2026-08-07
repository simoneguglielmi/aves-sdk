import { Context } from "effect";
import type { AvesTransportService } from "./types.js";

/** Effect service tag for AVES validate → envelope → HTTP → parse. */
export class AvesTransport extends Context.Tag("aves/Transport")<
	AvesTransport,
	AvesTransportService
>() {}
