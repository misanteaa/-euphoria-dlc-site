import { NextRequest, NextResponse } from "next/server"

const GOOGLE_DRIVE_URL = "https://drive.google.com/uc?export=download&id=1aTDsNJiaJVAYsJ7WYJUnR6PUQ0I7oMZV"

export async function GET(req: NextRequest) {
  return NextResponse.redirect(GOOGLE_DRIVE_URL)
}