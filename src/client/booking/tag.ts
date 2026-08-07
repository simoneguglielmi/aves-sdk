import { Context } from "effect";
import type { BookingService } from "./types.js";

/** Effect service tag for booking domain. */
export class AvesBooking extends Context.Tag("aves/Booking")<
	AvesBooking,
	BookingService
>() {}
