export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the configured byte limit.");
    this.name = "RequestBodyTooLargeError";
  }
}

async function cancelBody(body: ReadableStream<Uint8Array> | null) {
  if (!body) return;
  await body.cancel().catch(() => undefined);
}

export async function readBoundedTextBody(request: Request, maxBytes: number): Promise<string> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError("maxBytes must be a non-negative safe integer.");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength)) {
    const declaredBytes = Number(declaredLength);
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes > maxBytes) {
      await cancelBody(request.body);
      throw new RequestBodyTooLargeError();
    }
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value.byteLength > maxBytes - totalBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyTooLargeError();
      }

      chunks.push(value.slice());
      totalBytes += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bytes);
}
