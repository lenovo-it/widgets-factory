# Widgets Factory

This is a [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) factory repository.

## Prerequisites

Please set up the frontend dev environments, e.g., installing the [node.js](https://nodejs.org/en).

Make sure that you have
installed [pnpm](https://pnpm.io/installation#using-npm "Fast, disk space efficient package manager."). This is
the pivotal `npm package manager` for this project.

```shell
npm install -g pnpm
# Or
yarn global add pnpm
```

And you should have learned
one of
the [svelte](https://svelte.dev/), [vue3](https://vuejs.org/guide/introduction.html), [solid](https://www.solidjs.com/docs)
or [lit](https://lit.dev/docs/) web
frontend framework.

## Developing

In the beginning of the project setup, you should run `pnpm i` at least once to install all the required npm packages.

Then start your developing process by running `pnpm run dev`.

And visit the page where its path equals the folder you are looking for.
E.g. If you are developing the files under packages/hello-world,
you should visit the page [hello-world](http://localhost:9527/hello-world).

### Create a new package

run `pnpm widgets new` under the root of the package folder.

Now we only
support [svelte](https://svelte.dev/), [vue3](https://vuejs.org/guide/introduction.html), [solid](https://www.solidjs.com/docs)
or [lit](https://lit.dev/docs/) web frontend
framework.

## Concepts

For the file `index.ts` or `index.tsx`.

It is vital for the target package. It's the entry of the bundled files.

It contains the export statements for
our [custom-element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

And you will see that it contains a code block, like this:

```js
if (__DEV__) {
  // -- snip --
}
```

This is the `dev-use` only codes.
The code allows us to develop the package quickly, it will not be packed into the production-mode bundle files.

And for the file `tailwind.css` and `tailwind.config.js` are vital for integrating with
the [tailwindcss](https://tailwindcss.com/)
processing.

## Q&A

- Why didn't we support `React` framework yet?

  I didn't find the way to support that [Solid](https://solidjs.com/), [React](https://react.dev/)
  or [Preact](https://preactjs.com/) both exist in the project at the mean time.

  'Cause the process cannot figure out what `tsx` or `jsx` file is for `React`, `Preact` or `Solid`.
  Means only one `tsx` or `jsx` featured framework can be supported.

  Finally, I chose the [Solid](https://solidjs.com/) framework with the prejudice against
  the [React](https://react.dev/) framework.

- How about the bundle file size of each supported framework?

  First of
  all, [svelte](https://svelte.dev/) << [solid](https://www.solidjs.com/docs) ≈ [lit](https://lit.dev/docs/) << [vue3](https://vuejs.org/guide/introduction.html).

  E.g., We use the scaffold of the `tools/widgets-cli` for testing, the bundle file size of each flavour( framework ):
    - `svelte`: 17.3kB - 5.9kB (gzip).
    - `solid`: 36.1kB - 12.5kB (gzip). <mark>2.1x bigger</mark>
    - `lit`: 42.9kB - 14.8kB (gzip). <mark>2.5x bigger</mark>
    - `vue3`: 70.8kB - 25.9kB (gzip). <mark>4.4x bigger</mark>

  If we are focusing on the bundle file size, we should consider prioritizing to use the [svelte](https://svelte.dev/)
  framework.
