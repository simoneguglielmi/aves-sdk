import { layerFromDep } from "../layer-utils.js";
import { AvesTransport } from "../transport/tag.js";
import { makeMasterRecordsService } from "./service.js";
import { AvesMaster } from "./tag.js";

/** Live master-records — requires {@link AvesTransport}. */
export const AvesMasterLive = layerFromDep(
	AvesMaster,
	AvesTransport,
	makeMasterRecordsService,
);
