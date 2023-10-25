export default function tryURLParse(string, baseURL) {
  try {
    return new URL(string, baseURL);
  } catch (error) {
    return null;
  }
}
