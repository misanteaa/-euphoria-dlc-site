import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"
import { Readable } from "stream"

export async function GET(req: NextRequest) {
  const filePath = path.join(process.cwd(), "public", "launcher", "Euphoria.exe")

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const nodeStream = fs.createReadStream(filePath)
  const webStream = Readable.toWeb(nodeStream) as ReadableStream

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": stat.size.toString(),
      "Content-Disposition": 'attachment; filename="Euphoria.exe"'
    }
  })
}