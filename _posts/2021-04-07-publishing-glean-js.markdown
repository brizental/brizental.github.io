---
layout: post
title:  "This Week in Glean: Publishing Glean.js or How I configured a Javascript package that has multiple entry points"
date:   2021-04-07 18:00:00 +0100
categories: glean mozilla twig
---

_(“This Week in Glean” is a series of blog posts that the Glean Team at Mozilla is using to try to
communicate better about our work. They could be release notes, documentation, hopes, dreams, or
whatever: so long as it is inspired by Glean. You can find
[an index of all TWiG posts online](https://mozilla.github.io/glean/book/appendix/twig.htm)._

All "This Week in Glean" blog posts are listed in the [TWiG index](https://mozilla.github.io/glean/book/appendix/twig.html)
(and on the [Mozilla Data blog](https://blog.mozilla.org/data/category/glean/)).
This article is [cross-posted on the Mozilla Data blog](https://blog.mozilla.org/data/<TODO>).

---

A few weeks ago, it came the time for us to publish the first version of Glean.js in npm. (Yes,
it has been published. Go [take a look](https://www.npmjs.com/package/@mozilla/glean)). In order
to publish a package on npm, it is important to define the package entry points in the projects
[`package.json`](https://nodejs.org/api/packages.html) file. The entry point is the path to the file
that should be loaded when users import a package through `import Package from "package-name"` or
`const Package = require("package-name")`.

My knowledge in this area, went as far as "Hm, I think that [`main`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main)
field in the `package.json` is where we define the entry point, right?". Yes, I was right about that,
but turns out that was not enough for Glean.js.

## The case of Glean.js

Glean.js is an implementation of Glean for Javascript environments. "Javascript environments" can
mean multiple things: Node.js servers, Electron apps, websites, webextensions... The list goes on.
To complicate things, Glean.js needs to access a bunch of platform specific APIs, such as client
side storage. We designed Glean.js in such a way that platform specific code is abstracted away under
the [`Platform`](https://github.com/mozilla/glean.js/tree/main/glean/src/platform) module, but when
users import Glean.js all of this should be opaque.

To address this, wee decided to provide a different package entry point per environment. This way,
users can import the correct Glean for their environments and not care about internal architecture
details e.g. `import Glean from "glean/webext"` imports the version of Glean that users the web
extensions implementaion of the `Platform` module.

The `main` field I mentioned above, works when the package has one single entry point. What do you
do when the package has multiple entry points?

## The `exports` field

Lucky for us, starting from Node v12.7.0, Node recognizes the
[`exports`](https://nodejs.org/api/packages.html#packages_exports) field in the `package.json`.
This field accepts objects, so you can define mappings for all your package entry points.

```json
{
  "name": "glean",
  ...
  "exports": {
    "./webext": "path/to/entry/point/webext.js",
    "./node": "path/to/entry/point/node.js",
  }
}
```

> Another nice thing about the `exports` field, is that it denies access to any other entry point
> that is not defined in the `exports` map. Users can't just import any file in your package anymore.
> Neat.

We must also define entry points for the type declarations of our package. Type declarations are
necessary for users attempting to import the package in Typescript code. Glean.js is in Typescript,
so it is easy enough for us to _generate_ the type definitions, but we hit a wall when want to expose
the generated definitions. From the ["Publishing"](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package)
page on Typecript's documentation, this is the example provided:

```json
{
  "name": "awesome",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts"
}
```

Notice the `types` property. It works just like the `main` property. It does not accept an object,
but only a single entry point. And here we go again, what do you do when the package has multiple
entry points?

## The `typesVersions` workaround

This time I won't say "Lucky for us Typescript has this other property starting from version...".
Turns out Typescript, as I am writing this blog post, doesn't yet provide a way for packages to define
multiple entry points for their types declarations.

Typescript lets packages define different types declarations per Typescript version,
through the [`typesVersions`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#version-selection-with-typesversions)
property. This property does accept mappings of entry points to files. Smart people on the internet
figured out, that we can use this property to define different types declarations for each of our
package entry points. For more discussion on the topic, follow issue [#33079](https://github.com/microsoft/TypeScript/issues/33079).

Back to our previous example, type definitions mappings would look like this in our `package.json`:

```json
{
  "name": "glean",
  ...
  "exports": {
    "./webext": "path/to/entry/point/webext.js",
    "./node": "path/to/entry/point/node.js",
  }
  "typesVersions": {
    "*": {
      "./webext": [ "path/to/types/definitions/webext.d.ts" ],
      "./node": [ "path/to/types/definitions/node.d.ts" ],
    }
  }
}
```

Alright, this is great. So we are done, right? Not yet.

## Conditional exports

Our users can finally import our package in Javascript and Typescript and they have well
defined entry points to choose from depending on the platform they are building for.

If they are building for Node.js though, they still might encounter issues. The default module system
used by Node.js is [commonjs](https://nodejs.org/docs/latest/api/modules.html#modules_modules_commonjs_modules).
This is the one where we import packages by using the `const Package = require("package")` syntax
and export modules by using the `module.exports = Module` syntax.

[Newer versions of Node](https://nodejs.org/api/esm.html), also support the [ECMAScript module system](https://tc39.es/ecma262/#sec-modules)
, also known as ESM. This is the offical Javascript module system and is the one where we import
packages by using the `import Package from "package"` syntax and export modules by using the
`export default Package` syntax.

Packages can provide different builds to work in each module system. In the `exports` field, Node.js
allows packages to define different export paths to be imported depending on the module system
a user is relying on. This feature is called ["conditional exports"](https://nodejs.org/api/packages.html#packages_conditional_exports).

Assuming you have gone through all the setup involved in building a hybrid NPM module for both
ESM and CommonJS (to learn more about how to do that, refer to [this great blog post](https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html)),
this is how our example can be changed to use conditional exports:

```json
{
  "name": "glean",
  ...
  "exports": {
    "./webext": "path/to/entry/point/webext.js",
    "./node": {
      "import": "path/to/entry/point/node.js",
      "require": "path/to/entry/point/node.cjs",
    },
    ...
  }
  "typesVersions": {
    "*": {
      "./webext": [ "path/to/types/definitions/webext.d.ts" ],
      "./node": [ "path/to/types/definitions/node.d.ts" ],
      ...
    }
  }
}
```

The same change is not necessary for the `./webext` entry point, because users building for browsers
will need to use bundlers such as [Webpack](https://webpack.js.org/) and [Rollup](https://rollupjs.org/guide/en/),
which have their own implementation of import/require statement resolutions and are able to import
both ESM and CommonJS modules either [out-of-the-box](https://webpack.js.org/guides/ecma-script-modules/#flagging-modules-as-esm)
or through [plugins](https://github.com/rollup/plugins/tree/master/packages/commonjs).

> Note that there is also no need to change the `typesVersions` value for `./node` after this change.

## Final considerations

Although the steps in this post look straight forward enough, it took me quite a while to figure out
the correct way to provide the Glean.js' entry points. I encountered many caveats along the way, such
as the `typesVersions` workaround I mentioned above, but also:

- In order to support ES6 modules, it is necessary to include the filename and extension in all internal
package import statements. CommonJS infers the extension and the filename when it is not provided,
but ES6 doesn't. This get's extra weird in Glean.js' codebase, because Glean.js is in Typescript
and still all our import statements have the `.js` extension. See more discussion about this on
[this issue](https://github.com/microsoft/TypeScript/issues/16577#issuecomment-754941937) and
[our commit with this change](https://github.com/mozilla/glean.js/pull/123/commits/607c9d5285298f7afbc6187d3b2bdd7d0c1f25b3).
- Webpack below version 5, does not have support for the `exports` field and is not able to import a
package that defined entry points only using this feature. See the [Webpack 5 release notes](https://webpack.js.org/blog/2020-10-10-webpack-5-release/#major-changes-new-nodejs-ecosystem-features).
- Other conditional exports keywords such as `browser`, `production` or `development` are mentioned
in the [Node.js documentation](https://nodejs.org/api/packages.html#packages_conditions_definitions),
but are ultimately ignored by Node.js. They are used by bundlers such as Webpack and Rollup. The Webpack
documentation has [a comprehensive list of all the conditions](https://webpack.js.org/guides/package-exports/#conditions)
you can possibly include in that list, which bundler supports each and whether Node.js supports it too.

Hope this guide is helpful to other people on the internet. Bye! 👋
