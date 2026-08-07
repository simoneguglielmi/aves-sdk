import { layerFromDep } from "../layer-utils.js";
import { AvesTransport } from "../transport/tag.js";
import { makeBookingService } from "./service.js";
import { AvesBooking } from "./tag.js";

/** Live booking — requires {@link AvesTransport}. */
export const AvesBookingLive = layerFromDep(
	AvesBooking,
	AvesTransport,
	makeBookingService,
);
