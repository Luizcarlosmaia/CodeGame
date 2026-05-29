import type { Handler } from "@netlify/functions";
import { handleApiRequest } from "../../server/apiHandler.mjs";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
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
    headers: event.headers ?? {},
  });

  const headers = { ...corsHeaders };
  if (result.setCookie) {
    headers["Set-Cookie"] = result.setCookie;
  }

  if (result.redirect) {
    return {
      statusCode: result.status,
      headers: { ...headers, Location: result.redirect },
      body: "",
    };
  }

  return {
    statusCode: result.status,
    headers,
    body: JSON.stringify(result.body),
  };
};
