// @ts-check
import {defineConfig} from 'astro/config';
import {setDefaultLayout} from "./plugins/remark/defaultLayouts-plugin.mjs";

import preact from '@astrojs/preact';
import { Fragment, h } from 'preact';
import {remarkOfWikilinksPlugin} from "./plugins/remark/remarkOfWikilinks.ts";
import {remarkOfMediaLinksPlugin} from "./plugins/remark/remarkOfMediaLinks.ts";
import {getSlugMap} from "./plugins/remark/util/remarkOfWikiLinks-utils.ts";
import slugify from "voca/slugify";

import tailwindcss from '@tailwindcss/vite';
import {remarkRedactionsPlugin} from "./plugins/remark/remarkRedactions.ts";
import {ASTLogger} from "./plugins/util/ASTLogger.ts";
import rehypeReact from "rehype-react";
import {InlineRedaction} from "./src/components/Article/InlineRedaction";

// Build Route Map for wiki links
const slugMap = getSlugMap();

// https://astro.build/config
export default defineConfig({
    integrations: [preact({compat: true})],

    markdown: {
        remarkPlugins: [
            //@ts-ignore
            setDefaultLayout,
            // To update the mdast / run the processor again, set aliasDivider to some other string. This will update the wikilinks.
            // CHANGING THE ALIAS DIVIDER WILL NOT CHANGE BEHAVIOUR.
            [remarkOfWikilinksPlugin, {
                aliasDivider: 'b',
                pageResolver: (name: string) => pageResolver(name),
                hrefTemplate: (slug: string) => hrefTemplate(slug),
                slugMap
            }],
            remarkOfMediaLinksPlugin,
            remarkRedactionsPlugin,
            //@ts-ignore
            [ASTLogger, {index: 5}]
        ],
        rehypePlugins: [
            // [ASTLogger, {index: 1}]
            [rehypeReact, {
                createElement: h,
                Fragment,
                components: {
                    'inline-redaction': InlineRedaction
                }
            }]
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
