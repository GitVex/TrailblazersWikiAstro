import type {Plugin} from 'unified';
import type {Root} from 'mdast';
import {findAndReplace} from "mdast-util-find-and-replace";
import {extractSection, type SlugMap} from "./util/remarkOfWikiLinks-utils.ts";

const ALL_REGEX = /(!?)\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^\]]+))?]]/g;

type remarkOfWikiLinkPluginOptions = {
    slugMap: SlugMap;
    hrefTemplate?: (pageName: string) => string;
    pageResolver?: (pageName: string) => string;
    class?: string;
    maxDepth?: number;
};

const isMedia = (matchedName: string): boolean =>
    ['.mp4', '.webm', '.pdf'].some(ext => matchedName.includes(ext));

const isImage = (matchedName: string): boolean =>
    ['.jpg', '.png', '.gif'].some(ext => matchedName.includes(ext));

export const remarkOfWikilinksPlugin: Plugin<[remarkOfWikiLinkPluginOptions], Root> = (options) => {
    const {
        hrefTemplate = (pageName: string) => `/${pageName}`,
        pageResolver = (pageName: string) => pageName,
        class: className = 'internal',
        slugMap,
        maxDepth = 5
    } = options;

    function processTree(tree: Root, depth = 0) {
        if (depth > maxDepth) {
            return;
        }

        const replacer = (match: string): any => {
            const groups = new RegExp(ALL_REGEX).exec(match);
            if (!groups) {
                return {type: 'text', value: 'PARSING ERROR'};
            }

            const embed = groups[1] === '!';
            const matchedName = groups[2] as string;
            const heading = groups[3];
            const alias = groups[4];

            const slug = pageResolver(matchedName);
            const sluggedHeading = pageResolver(heading);

            if (embed) {
                if (isImage(matchedName)) {
                    return {
                        type: 'image',
                        url: `/src/images/${matchedName}`,
                        data: {hProperties: {class: 'image-embed'}}
                    };
                } else if (isMedia(matchedName)) {
                    return {type: 'text', value: `<<Oops, no media embeds yet>>`};
                }

                const filePath = slugMap[slug]?.filePath;

                if (filePath && heading) {
                    const subTree = extractSection(filePath, heading);
                    if (!subTree) return;
                    return subTree.children[0];
                }

                return {
                    type: 'text',
                    value: `<<Oops, something went wrong. Could not embed "${slug}" and Heading "${heading}">>`
                };
            }

            const href = hrefTemplate(slug ?? '') + (sluggedHeading ? `#${sluggedHeading.toLowerCase()}` : '');

            if (href === 'undefined') {
                return {type: 'html', value: `<span class="not-resolved">${alias ?? matchedName}</span>`};
            }

            return {
                type: 'link',
                url: href,
                data: {hProperties: {class: className}},
                children: [{type: 'text', value: alias ?? matchedName}]
            };
        };

        findAndReplace(tree, [ALL_REGEX, replacer]);
    }

    return (tree: Root) => {
        processTree(tree);
    };
};
