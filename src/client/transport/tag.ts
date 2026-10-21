import { Context } from "effect";
import type { AvesTransportService } from "./types.js";

/** Effect service for AVES validate → envelope → HTTP → parse. */
export class AvesTransport extends Context.Service<
	AvesTransport,
	AvesTransportService
>()("aves/Transport") {}
