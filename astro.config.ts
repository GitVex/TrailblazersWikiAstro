// @ts-check
import {defineConfig} from 'astro/config';

// import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";

import preact from '@astrojs/preact';
import {remarkOfWikilinksPlugin} from "./plugins/remarkOfWikilinks.ts";
import {remarkOfMediaLinksPlugin} from "./plugins/remarkOfMediaLinks.ts";
import {remarkASTLogger} from "./plugins/util/remarkASTLogger.ts";
import {getSlugMap} from "./plugins/util/remarkOfWikiLinks-utils.ts";
import slugify from "voca/slugify";

import tailwindcss from '@tailwindcss/vite';
import {remarkRedactionsPlugin} from "./plugins/remarkRedactions.ts";

// Build Route Map for wiki links
const slugMap = getSlugMap();
// console.log(slugToRoute);

// https://astro.build/config
export default defineConfig({
    integrations: [preact()],

    markdown: {
        remarkPlugins: [
            // [remarkASTLogger, { index: 1 }],

            setDefaultLayout,

            // [remarkASTLogger, { index: 2 }],

            // If wikilinks don't update, set aliasDivider to some other string. This will update the wikilinks.
            // CHANGING THE ALIAS DIVIDER WILL NOT CHANGE BEHAVIOUR.
            [remarkOfWikilinksPlugin, {
                aliasDivider: 'b',
                pageResolver: (name: string) => pageResolver(name),
                hrefTemplate: (slug: string) => hrefTemplate(slug),
                slugMap
            }],

            //[remarkASTLogger, { index: 3 }],

            remarkOfMediaLinksPlugin,

            //[remarkASTLogger, { index: 4 }]

            remarkRedactionsPlugin,

            [remarkASTLogger, { index: 5 }]
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
