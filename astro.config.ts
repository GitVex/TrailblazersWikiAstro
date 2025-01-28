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

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), preact()],
    markdown: {
        remarkPlugins: [
            setDefaultLayout,
            remarkGfm,
            [wikiLinkPlugin, {
                aliasDivider: '|',
                pageResolver: (name: string) => [name.replace(/\s+/g, '-').toLowerCase()],
                hrefTemplate: (slug: string) => slugToRoute.get(slug)?.concat('/', slug).toLowerCase()
            }]
        ]
    }
});

// wiki links docs : https://github.com/landakram/remark-wiki-link