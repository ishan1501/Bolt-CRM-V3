import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://api-v2.mastersunion.org";

// Required for Netlify SSR — disables static caching of this route
export const dynamic = "force-dynamic";

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await context.params;
  const path = pathParts.join("/");
  const url = new URL(`/${path}`, BACKEND_URL);

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward auth header if present
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.text();
    } catch {
      // no body
    }
  }

  const backendRes = await fetch(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const data = await backendRes.text();
  
  return new NextResponse(data, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("Content-Type") || "application/json",
    },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, ctx);
}
