// https://url.spec.whatwg.org/#special-scheme
const specialProtocols = new Set([
  "ftp:",
  "file:",
  "http:",
  "https:",
  "ws:",
  "wss:",
]);

export default function isSpecial(url) {
  return specialProtocols.has(url.protocol);
}
