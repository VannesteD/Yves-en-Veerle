import { describe, expect, it } from "vitest";

import { readBoundedTextBody, RequestBodyTooLargeError } from "./request-body";

const MAX_BYTES = 32_000;

function streamedRequest(chunks: Uint8Array[], headers?: HeadersInit) {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[pulls];
      pulls += 1;
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("https://example.test/api/checkout", {
    method: "POST",
    headers,
    body,
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  return {
    request,
    wasCancelled: () => cancelled,
    pullCount: () => pulls,
  };
}

describe("readBoundedTextBody", () => {
  it("aanvaardt exact 32.000 ontvangen UTF-8-bytes", async () => {
    const text = "é".repeat(16_000);
    const request = new Request("https://example.test/api/checkout", {
      method: "POST",
      body: text,
    });

    await expect(readBoundedTextBody(request, MAX_BYTES)).resolves.toBe(text);
  });

  it("stopt en annuleert zodra gestreamde data de limiet overschrijdt", async () => {
    const chunk = new Uint8Array(10_000).fill(97);
    const streamed = streamedRequest(Array.from({ length: 10 }, () => chunk));

    await expect(readBoundedTextBody(streamed.request, MAX_BYTES)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
    expect(streamed.wasCancelled()).toBe(true);
    expect(streamed.pullCount()).toBeLessThan(10);
  });

  it("vertrouwt een te kleine Content-Length niet", async () => {
    const chunk = new Uint8Array(20_000).fill(97);
    const streamed = streamedRequest([chunk, chunk], { "content-length": "1" });

    await expect(readBoundedTextBody(streamed.request, MAX_BYTES)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
    expect(streamed.wasCancelled()).toBe(true);
  });

  it("weigert een te grote Content-Length en annuleert de body", async () => {
    const streamed = streamedRequest([new Uint8Array(1)], { "content-length": "32001" });

    await expect(readBoundedTextBody(streamed.request, MAX_BYTES)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
    expect(streamed.wasCancelled()).toBe(true);
  });

  it("decodeert UTF-8 correct wanneer een teken over chunks is gesplitst", async () => {
    const encoded = new TextEncoder().encode("Vlees 🥩");
    const streamed = streamedRequest([encoded.slice(0, 8), encoded.slice(8, 10), encoded.slice(10)]);

    await expect(readBoundedTextBody(streamed.request, MAX_BYTES)).resolves.toBe("Vlees 🥩");
  });

  it("behoudt het bestaande gedrag voor een ontbrekende body", async () => {
    const request = new Request("https://example.test/api/checkout", { method: "POST" });

    await expect(readBoundedTextBody(request, MAX_BYTES)).resolves.toBe("");
  });
});
