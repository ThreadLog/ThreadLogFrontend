import "./lib/error-capture";
import { handleApiRequest } from "./server/api-router";
import serverEntry from "@tanstack/react-start/server-entry";

const { fetch: originalFetch } = serverEntry as { fetch: (request: Request) => Promise<Response> };

async function fetch(request: Request): Promise<Response> {
  const apiResponse = await handleApiRequest(request);
  if (apiResponse) return apiResponse;
  return originalFetch(request);
}

export default { fetch };
