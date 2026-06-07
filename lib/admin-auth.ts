import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const ADMIN_TOKEN_ENV = "ADMIN_API_TOKEN";

function getRequestToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  return bearerMatch?.[1]?.trim() || request.headers.get("x-admin-token")?.trim() || "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminApiConfigured() {
  return Boolean(process.env[ADMIN_TOKEN_ENV]);
}

export function isAuthorizedAdminRequest(request: Request) {
  const expectedToken = process.env[ADMIN_TOKEN_ENV];

  if (!expectedToken) {
    return process.env.NODE_ENV !== "production";
  }

  const requestToken = getRequestToken(request);
  return Boolean(requestToken && safeEqual(requestToken, expectedToken));
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Admin API token is required."
    },
    {
      headers: {
        "Cache-Control": "no-store"
      },
      status: 401
    }
  );
}

function withNoStoreHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Cache-Control", "no-store");
  return nextHeaders;
}

export function adminJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: withNoStoreHeaders(init?.headers)
  });
}
