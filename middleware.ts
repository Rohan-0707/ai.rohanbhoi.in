import { NextRequest, NextResponse } from "next/server";

const SOCKET_INTERNAL_URL =
  process.env.SOCKET_INTERNAL_URL || "http://127.0.0.1:3001";

const SESSION_COOKIE = "jalvayu_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-plans",
  "/profile",
  "/settings",
  "/safety-guides",
];

function buildProxyHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey === "host" ||
      lowerKey === "connection" ||
      lowerKey === "upgrade" ||
      lowerKey === "keep-alive" ||
      lowerKey === "transfer-encoding"
    ) {
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

async function proxySocketIo(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    SOCKET_INTERNAL_URL,
  );

  const init: RequestInit = {
    method: request.method,
    headers: buildProxyHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl.toString(), init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/socket.io")) {
    try {
      return await proxySocketIo(request);
    } catch (error) {
      console.error("[middleware:socket.io] Proxy failed:", error);
      return NextResponse.json(
        { error: "Socket proxy unavailable" },
        { status: 502 },
      );
    }
  }

  if (pathname === "/login") {
    const session = request.cookies.get(SESSION_COOKIE);
    if (session?.value) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isProtectedRoute(pathname)) {
    const session = request.cookies.get(SESSION_COOKIE);

    if (!session?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/socket.io",
    "/socket.io/:path*",
    "/login",
    "/dashboard",
    "/dashboard/:path*",
    "/my-plans",
    "/my-plans/:path*",
    "/profile",
    "/profile/:path*",
    "/settings",
    "/settings/:path*",
    "/safety-guides",
    "/safety-guides/:path*",
  ],
};
