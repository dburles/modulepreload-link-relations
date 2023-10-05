# modulepreload-link-relations

A utility for generating [modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload) link relations based on a JavaScript modules import graph. This will prevent module request waterfalls.

It can be used for HTTP server middleware and generating [\<link\>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) elements in static HTML.

## Install

```sh
npm i modulepreload-link-relations
```

## Usage

This package exports two functions:

- `resolveLinkRelations`
  - Returns an array of modules that can be preloaded for a module. An in-memory cache persists the resulting module import graph.
- `formatLinkHeaderRelations`
  - A formatter that can be used to generate link relations for an HTTP [Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) entity-header.

## Example

```js
import resolveLinkRelations from "modulepreload-link-relations/resolveLinkRelations.mjs";
import formatLinkHeaderRelations from "modulepreload-link-relations/formatLinkHeaderRelations.mjs";

const linkRelations = await resolveLinkRelations({
  // The application path.
  appPath: "./app",
  // The requested module.
  url: "/lib/a.js",
}); // => ['/lib/c.js', '/lib/d.js']

// Optionally format the result:
const formattedLinkRelations = formatLinkHeaderRelations(linkRelations); // => </lib/c.js>; rel="modulepreload", </lib/d.js>; rel="modulepreload"
```

## Middleware

TODO
