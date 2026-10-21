import { Context } from "effect";
import type { BookingService } from "./service.js";

/** Effect service for booking domain. */
export class AvesBooking extends Context.Service<AvesBooking, BookingService>()(
	"aves/Booking",
) {}
