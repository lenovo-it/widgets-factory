import * as glob from 'glob';
import path from 'path';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import type { RsbuildEntry } from '@rsbuild/core';

const COMMA_SPLIT_REGEXP = /\s*,\s*/;
const VALID_PACKAGE_ARGV_NAME = ['--package', '-p'];
const DEV_SERVER_PORT = 9527;

const entry = getEntry({
  targetEntryNames: filterTargetEntryNames(),
});

function filterTargetEntryNames(): string[] {
  const names = new Set<string>();

  process.argv.forEach(function (arg, idx) {
    if (VALID_PACKAGE_ARGV_NAME.includes(arg)) {
      const name = process.argv[idx + 1];
      if (name) {
        name.split(COMMA_SPLIT_REGEXP).forEach(function (n) {
          if (n) {
            names.add(n);
          }
        });
      }
    }
  });

  return Array.from(names);
}

function getEntry(options?: Partial<{ targetEntryNames: string[] }>): RsbuildEntry {
  const targetEntryNames = options?.targetEntryNames;

  const entries = {};
  glob.sync(['./packages/!(shared|node_modules)/src/index.ts?(x)']).forEach(function (filePath) {
    const [pageName] = filePath.split(path.sep).slice(-3);

    if (targetEntryNames && targetEntryNames.length && !targetEntryNames.includes(pageName)) {
      return;
    }

    // Put the file under the [pageName] folder.
    entries[pageName] = {
      pageName,
      import: filePath,
      filename: `${pageName}/index.js`,
    };
  });

  return entries;
}

export default defineConfig(function () {
  return {
    plugins: [
      pluginSvelte({
        svelteLoaderOptions: {
          compilerOptions: {
            customElement: true,
            css: 'injected',
          },
        },
      }),
      pluginVue({ vueLoaderOptions: { customElement: true } }),
      pluginBabel({
        include: /\.tsx$/,
        exclude: /[\\/]node_modules[\\/]/,
      }),
      pluginSolid({
        solidPresetOptions: {
          contextToCustomElements: true,
        },
      }),
    ],
    source: {
      entry,
    },
    output: {
      filenameHash: false,
      legalComments: 'none',
      targets: ['web'],
      injectStyles: true,
    },
    tools: {
      rspack(config, { appendPlugins, rspack, isProd, isDev, env }) {
        // Define plugin.
        appendPlugins(
          new rspack.DefinePlugin({
            __DEV__: isDev,
            __PRODUCTION__: isProd,
            __TEST__: env === 'test',
          }),
        );

        // Only register the plugin when RSDOCTOR is true, as the plugin will increase the build time.
        /** @see https://rsdoctor.dev/guide/start/quick-start#rsbuild */
        if (process.env.RSDOCTOR) {
          appendPlugins(new RsdoctorRspackPlugin({}));
        }

        // I have no idea to add the banner as comment in the bundled file.
        // The `SwcJsMinimizerRspackPlugin` will alwasy remove all the comments when `legalComments: 'none'`.
        // So I decide to add a side effect codes to indicate the metrics about this package.
        if (isProd) {
          appendPlugins(
            new rspack.BannerPlugin({
              banner: `try {
                window['__widgets-[name]-metrics__'] = {
                  hash: '[hash]',
                  bundledTime: '${new Date().toISOString()}'
                };
              } catch(e) {}`,
              entryOnly: true,
              raw: true,
            }),
          );
        }
      },
      sass(config) {
        config.implementation = require('sass');

        return config;
      },
      styleLoader(config) {
        // config.insert = 'head';

        /** @see https://github.com/webpack-contrib/style-loader?tab=readme-ov-file#custom-elements-shadow-dom */
        // The below codes supports for 'lit' or 'react-liked' frameworks.
        // Nothing impact for `svelte` or `vue3-SingleFileComponent(*.vue)`.
        config.injectType = 'lazyStyleTag';
        // Do not forget that this code will be used in the browser and
        // not all browsers support the latest ECMA features like `let`, `const`, `arrow function expression`, etc.,
        // we recommend using only ECMA 5 features,
        // but it depends on what browsers you want to support
        // @ts-ignore
        config.insert = function insertIntoTarget(
          element: HTMLStyleElement,
          options?: Partial<{
            target: ShadowRoot | HTMLElement; // The `shadowRoot` or something.
          }>,
        ) {
          const parent = options?.target || document.head;

          parent.appendChild(element);
        };

        return config;
      },
      postcss(options, utils) {
        utils.addPlugins(require('tailwindcss'));

        /** @see https://rsbuild.dev/config/output/inject-styles#usage-scenario */
        if (process.env.NODE_ENV === 'production') {
          utils.addPlugins(require('cssnano'));
        }

        return;
      },
    },
    performance: {
      chunkSplit: {
        strategy: 'all-in-one',
      },
    },
    html: {
      title(config) {
        return config.entryName;
      },
      outputStructure: 'nested', // [name]/index.html
    },
    server: {
      port: DEV_SERVER_PORT,
    },
    dev: {
      startUrl: `http://localhost:${DEV_SERVER_PORT}/${Object.keys(entry)[0]}`,
    },
  };
});
