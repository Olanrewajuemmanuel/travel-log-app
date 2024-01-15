export function verifyTokenAccess(cookie: any) {
  if (cookie.accessToken === "undefined" || !cookie.accessToken) return false;
  return true;
}
