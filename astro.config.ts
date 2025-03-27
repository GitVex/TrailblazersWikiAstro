// @ts-check
import {defineConfig} from 'astro/config';

// import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';

import preact from '@astrojs/preact';
import {remarkOfWikilinksPlugin} from "./plugins/remarkOfWikilinks.ts";
import { remarkOfMediaLinksPlugin } from "./plugins/remarkOfMediaLinks.ts";
import { getSlugMap } from "./plugins/util/remarkOfWikiLinks-utils.ts";
import slugify from "voca/slugify";

import tailwindcss from '@tailwindcss/vite';

// Build Route Map for wiki links
const slugMap = getSlugMap();
// console.log(slugToRoute);

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  markdown: {
      remarkPlugins: [
          setDefaultLayout,
          remarkGfm,
          // If wikilinks don't update, set aliasDivider to "['|']". This will throw an error. After throwing the
          // error, set aliasDivider back to "|". This will update the wikilinks.
          // CHANGING THE ALIAS DIVIDER WILL NOT CHANGE BEHAVIOUR.
          [remarkOfWikilinksPlugin, {
              aliasDivider: '|',
              pageResolver: (name: string) => pageResolver(name),
              hrefTemplate: (slug: string) => hrefTemplate(slug),
              slugMap
          }],
          remarkOfMediaLinksPlugin,
      ]

  },

  vite: {
    plugins: [tailwindcss()]
  }
});

export function pageResolver(name: string) {
    // console.log('name', name);
    return slugify(name);
}

export function hrefTemplate(slug: string) {
    // console.log('slug', slug);
    return cleanURL(slugMap[slug]?.route);
}

function cleanURL(string: string | undefined) {
    return string?.replace(/\s+/g, '-')
        .replace(/%20+/g, '-')
        .toLowerCase()
        .replace('\\', '');
}

// wiki links docs : https://github.com/landakram/remark-wiki-link
