import type { Handler } from "@netlify/functions";
import { handleApiRequest } from "../../server/apiHandler.mjs";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const result = await handleApiRequest({
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters ?? {},
    body: event.body,
  });

  return {
    statusCode: result.status,
    headers: corsHeaders,
    body: JSON.stringify(result.body),
  };
};
