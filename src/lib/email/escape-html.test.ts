import { describe, expect, it } from "vitest";

import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("maakt door gebruikers ingevoerde HTML onschadelijk", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')"> & test`)).toBe("&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; test");
  });
});
