// @ts-check
import {defineConfig} from 'astro/config';

import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link'

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind()],
    markdown: {
        remarkPlugins: [
            setDefaultLayout,
            remarkGfm,
            [wikiLinkPlugin, {
                aliasDivider: '|',
                hrefTemplate: (permalink: string) => `/${permalink}`,
                pageResolver: (name: string) => [name]
            }]],
    }
});

// wiki links docs : https://github.com/landakram/remark-wiki-link