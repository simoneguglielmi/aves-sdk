import { Context } from "effect";
import type { BookingService } from "./service.js";

/** Effect service tag for booking domain. */
export class AvesBooking extends Context.Tag("aves/Booking")<
	AvesBooking,
	BookingService
>() {}
