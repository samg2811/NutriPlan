import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Missing 'query' parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "USDA API key not configured" },
      { status: 500 }
    );
  }

  const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=5&api_key=${apiKey}`;

  const response = await fetch(usdaUrl);

  if (!response.ok) {
    return NextResponse.json(
      { error: "USDA API request failed" },
      { status: response.status }
    );
  }

  const data = await response.json();

  return NextResponse.json(data);
}
