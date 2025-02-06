// @ts-check
import {defineConfig} from 'astro/config';

import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';

import preact from '@astrojs/preact';
import {remarkOfWikilinksPlugin} from "./plugins/remarkOfWikilinks.ts";
import { getRouteMap } from "./plugins/util/remarkOfWikiLinks-utils.ts";

// Build Route Map for wiki links
const slugToRoute = getRouteMap();
// console.log(slugToRoute);

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), preact()],
    markdown: {
        remarkPlugins: [
            setDefaultLayout,
            remarkGfm,
            // If wikilinks don't update, set aliasDivider to "['|']". This will throw an error. After throwing the
            // error, set aliasDivider back to "|". This will update the wikilinks.
            // CHANGING THE ALIAS DIVIDER WILL NOT CHANGE BEHAVIOUR.
            [remarkOfWikilinksPlugin, {
                aliasDivider: ['|'],
                pageResolver: (name: string) => pageResolver(name),
                hrefTemplate: (slug: string) => hrefTemplate(slug),
            }]
        ]

    }
});

function pageResolver(name: string) {
    // console.log('name', name);
    return slugify(name);
}

function hrefTemplate(slug: string) {
    // console.log('slug', slug);
    return slugify(slugToRoute.get(slug)?.concat('/', slug));
}

function slugify(string: string | undefined) {
    return string?.replace(/\s+/g, '-')
        .replace(/%20+/g, '-')
        .toLowerCase()
        .replace('\\', '');
}

// wiki links docs : https://github.com/landakram/remark-wiki-link
