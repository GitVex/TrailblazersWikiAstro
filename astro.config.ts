// @ts-check
import {defineConfig} from 'astro/config';

import tailwind from '@astrojs/tailwind';
import {setDefaultLayout} from "./plugins/defaultLayouts-plugin.mjs";
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link'

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), preact()],
    markdown: {
        remarkPlugins: [
            setDefaultLayout,
            remarkGfm,
            [wikiLinkPlugin, {
                aliasDivider: '|',
                hrefTemplate: (permalink: string) => `/content/${permalink}`,
                pageResolver: (name: string) => [name.replace(/ /g, '-' ).toLowerCase()]
            }]],
    }
});

// wiki links docs : https://github.com/landakram/remark-wiki-link