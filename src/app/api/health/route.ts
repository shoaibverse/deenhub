export const dynamic = "force-dynamic";

/** NoorHub has no database dependency; health only checks the application. */
export async function GET() {
  return Response.json({
    ok: true,
    storage: "browser-local",
    database: "not-required",
  });
}
