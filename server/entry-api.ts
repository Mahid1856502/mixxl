import "dotenv/config";
import { listen, startCore } from "./bootstrap-core";

const { server } = await startCore();
listen(server);
