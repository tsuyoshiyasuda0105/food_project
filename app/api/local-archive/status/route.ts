import { adminJson, isAuthorizedAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getLocalArchiveStatus } from "@/lib/local-archive";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  return adminJson({
    ok: true,
    ...getLocalArchiveStatus()
  });
}
