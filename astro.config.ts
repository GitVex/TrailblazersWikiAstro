// @ts-check
import {defineConfig} from 'astro/config';

import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';

import preact from '@astrojs/preact';
import wikiLinkPlugin from "remark-wiki-link";
import getRouteMap from "./plugins/dynamicWikiLinks.ts";

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
            [wikiLinkPlugin, {
                aliasDivider: '|',
                pageResolver: (name: string) => pageResolver(name),
                hrefTemplate: (slug: string) => hrefTemplate(slug),
            }]
        ]
    }
});

function pageResolver(name: string) {
    console.log('name', name);
    return [sanitize(name)];
}

function hrefTemplate(slug: string) {
    console.log('slug', slug);
    return sanitize(slugToRoute.get(slug)?.concat('/', slug));
}

function sanitize(string: string | undefined) {
    return string?.replace(/\s+/g, '-').toLowerCase().replace('\\', '');
}

// wiki links docs : https://github.com/landakram/remark-wiki-link