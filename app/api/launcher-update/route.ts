import { NextRequest, NextResponse } from "next/server"

const CURRENT_VERSION = "1.21.8"
const DOWNLOAD_URL = "https://euphoria-dlc-site-production.up.railway.app/api/launcher-download"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    version: CURRENT_VERSION,
    url: DOWNLOAD_URL,
    size: 0
  })
}