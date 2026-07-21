import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest) {
  const filePath = path.join(process.cwd(), "public", "launcher", "Euphoria.exe")

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const stream = fs.createReadStream(filePath)

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": stat.size.toString(),
      "Content-Disposition": 'attachment; filename="Euphoria.exe"'
    }
  })
}