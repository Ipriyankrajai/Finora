import { auth } from "@finora/auth";
import { toNextJsHandler } from "@finora/auth";

export const { GET, POST } = toNextJsHandler(auth);

