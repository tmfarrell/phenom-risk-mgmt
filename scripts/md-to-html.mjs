import { readFileSync, writeFileSync } from 'node:fs';
import { marked } from 'marked';

const md = readFileSync('docs/PhenOM_Inference_API.md', 'utf8');
const body = marked(md);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PhenOM Inference API</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f5f7fb;
        --fg: #0f172a;
        --muted: #4b5563;
        --card-bg: #ffffff;
        --border: #e5e7eb;
        --accent: #2563eb;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .page-header {
        border-bottom: 1px solid var(--border);
        background: #ffffffcc;
        backdrop-filter: blur(8px);
      }
      .page-header-inner {
        max-width: 960px;
        margin: 0 auto;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .brand img {
        height: 32px;
        width: auto;
      }
      .brand-title {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .page-main {
        flex: 1;
        padding: 24px 16px 40px;
      }
      .content-card {
        max-width: 1120px;
        margin: 0 auto;
        background: var(--card-bg);
        border-radius: 12px;
        border: 1px solid var(--border);
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        padding: 24px 24px 32px;
      }
      @media (min-width: 768px) {
        .content-card {
          padding: 32px 40px 40px;
        }
      }
      .markdown-body {
        font-size: 13px;
        line-height: 1.6;
      }
      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3 {
        color: var(--fg);
        font-weight: 600;
      }
      .markdown-body h1 {
        font-size: 24px;
        margin-top: 0;
      }
      .markdown-body h2 {
        font-size: 19px;
        margin-top: 24px;
      }
      .markdown-body h3 {
        font-size: 16px;
        margin-top: 20px;
      }
      .markdown-body p {
        margin: 0 0 0.75em;
        color: var(--muted);
      }
      .markdown-body code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          "Liberation Mono", "Courier New", monospace;
        font-size: 11px; /* smaller inline/code blocks */
        background: #0f172a0d;
        padding: 1px 3px;
        border-radius: 3px;
      }
      .markdown-body pre code {
        background: none;
        padding: 0;
      }
      .markdown-body pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          "Liberation Mono", "Courier New", monospace;
        font-size: 10px; /* much smaller code blocks */
        line-height: 1.4;
        background: #020617;
        color: #e5e7eb;
        padding: 10px 12px;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #0f172a;
        margin: 0 0 1.1em;
      }
      .markdown-body hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 20px 0;
      }
      .markdown-body ul {
        padding-left: 1.25rem;
      }
      .markdown-body li {
        margin-bottom: 0.25em;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="page-header">
        <div class="page-header-inner">
          <div class="brand">
            <img src="om1_logo_clr.png" alt="OM1 logo" />
          </div>
        </div>
      </header>
      <main class="page-main">
        <div class="content-card">
          <article class="markdown-body">
${body}
          </article>
        </div>
      </main>
    </div>
  </body>
</html>`;

writeFileSync('public/phenom-inference-api.html', html);