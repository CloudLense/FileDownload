// The same secret must be visible to the Node functions (process.env) and the
// /dl edge function (Netlify.env), so set DOWNLOAD_SECRET in Netlify's
// Site configuration → Environment variables with scope "All".
export function downloadSecret(): string {
  const secret = process.env.DOWNLOAD_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-insecure-secret';
  return '';
}
