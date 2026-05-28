import { handleApiRequest } from "../../server/apiHandler.mjs";

/** Cron diário — remove temporárias com expiraEm <= now da Neon. */
export default async function handler() {
  const result = await handleApiRequest({
    method: "POST",
    path: "/rooms/cleanup-expired",
    query: {},
    body: null,
  });

  console.log("cleanup-expired:", result.body);

  return {
    statusCode: result.status,
    body: JSON.stringify(result.body),
  };
}

export const config = {
  schedule: "0 4 * * *",
};
