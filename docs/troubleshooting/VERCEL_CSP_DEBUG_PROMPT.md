# Vercel CSP Configuration Issue - Debug & Resolution Prompt

## Problem Statement

Our ChainEquity frontend is deployed to Vercel at https://chainequity-mlx.vercel.app/, but MetaMask wallet connection is failing with a Content Security Policy error: "Content Security Policy of your site blocks the use of 'eval' in JavaScript" (specifically `script-src blocked`). The MetaMask Chrome extension is working fine, but the in-app connection modal is being blocked by CSP. We need to allow `unsafe-eval` in the `script-src` directive because wagmi/viem (our Web3 libraries) require it for dynamic code execution. We've attempted to configure CSP headers via `vercel.json` with a `headers` array containing the appropriate CSP policy, but Vercel is NOT applying these headers (verified via `curl -I` showing no `Content-Security-Policy` header). We also tried using a `ui/public/_headers` file (Netlify format) and a `<meta>` tag in `index.html`, but removed both to avoid conflicts. The Root Directory setting in Vercel is empty (correct for our monorepo structure with `buildCommand: "cd ui && npm install && npm run build"` and `outputDirectory: "ui/dist"`).

The primary issue is that we cannot find a "Headers" section in the Vercel Dashboard under Project Settings to manually configure HTTP headers, which is the recommended solution when `vercel.json` headers don't work with custom build commands. We need to either: (1) determine why Vercel is not reading the `headers` configuration from our `vercel.json` file and fix it, (2) find the correct location in the Vercel Dashboard to manually add CSP headers, or (3) implement an alternative approach (such as using Vercel's middleware, environment-specific configuration, or modifying the build output) to inject the required CSP header that allows `unsafe-eval` for script execution. The CSP policy we need is: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss: http://localhost:* https://*.railway.app https://*.base.org https://*.basescan.org https://*.vercel.app; frame-src 'self' https:; object-src 'none'; base-uri 'self';`

## Current Project Structure
- Monorepo with `ui/` subdirectory containing the React + Vite frontend
- `vercel.json` at project root with custom build settings
- Deployment URL: https://chainequity-mlx.vercel.app/
- GitHub auto-deploy is enabled

## Files to Examine
- `/Users/mylessjs/Desktop/ChainEquity/vercel.json` (current CSP headers configuration)
- `/Users/mylessjs/Desktop/ChainEquity/ui/index.html` (no CSP meta tag)
- `/Users/mylessjs/Desktop/ChainEquity/ui/vite.config.ts` (Vite configuration)

## Recommended Model
**Claude 3.5 Sonnet** or **GPT-4** - This is a complex infrastructure/deployment debugging task that requires:
- Deep understanding of Vercel's configuration precedence
- Knowledge of CSP directives and browser security policies
- Experience with monorepo deployment configurations
- Ability to debug why configuration files aren't being respected
- Creative problem-solving for alternative implementation approaches

