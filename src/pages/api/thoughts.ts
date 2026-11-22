import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
};
