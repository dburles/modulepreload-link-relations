# modulepreload-link-relations

A utility for generating [modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload) link relations for an HTTP [Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) entity-header based on a requested modules import graph. This will mitigate request waterfalls as the resulting dependency tree will be requested in parallel.

## Usage

This package is intended to be used by HTTP server middleware. It exports a function `resolveLinkRelations` that returns link relations to be sent in the [Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) header. An in-memory cache persists the resulting module import graph.

#### Example

```js
import resolveLinkRelations from "modulepreload-link-relations/resolveLinkRelations.mjs";

const linkRelations = await resolveLinkRelations({
  // The application path.
  appPath: "./app",
  // The requested module.
  url: "http://localhost/lib/a.js",
}); // => </lib/c.js>; rel="modulepreload", </lib/d.js>; rel="modulepreload"
```

## Middleware

TODO
