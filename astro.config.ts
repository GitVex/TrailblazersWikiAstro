// @ts-check
import {defineConfig} from 'astro/config';

import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';

import preact from '@astrojs/preact';
import dynamicWikiLinks from "./plugins/dynamicWikiLinks.ts";

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), preact()],
    markdown: {
        remarkPlugins: [
            setDefaultLayout,
            remarkGfm,
            // dynamicWikiLinks,
        ]
    }
});

// wiki links docs : https://github.com/landakram/remark-wiki-link