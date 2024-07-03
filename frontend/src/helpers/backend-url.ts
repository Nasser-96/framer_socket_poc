export default function GetBackendUrl() {
  const isLocalHost = true;
  if (isLocalHost) {
    return `https://${process.env.NEXT_PUBLIC_BACKEND_URL}/`;
  }
}
