import type {Plugin} from 'unified';
import type {Root} from 'mdast';
import {findAndReplace} from "mdast-util-find-and-replace";
import {extractSection, getPathMap} from "./util/remarkOfWikiLinks-utils.ts";

/**
 * Match group breakdown:
 *  1.  Optional “!” for embedding
 *  2.  File/page name (anything not #, |, or ] allowed)
 *  3.  Optional heading after "#"
 *  4.  Optional alias after "|"
 */
const ALL_REGEX = /(!?)\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^\]]+))?]]/g;
const pathMap = getPathMap();

type remarkOfWikiLinkPluginOptions = {
    hrefTemplate?: (pageName: string) => string;
    pageResolver?: (pageName: string) => string | null;
    class?: string;
};

const isMedia: (matchedName: string) => boolean = (matchedName) => {
    return matchedName.includes('.jpg')
        || matchedName.includes('.png')
        || matchedName.includes('.gif')
        || matchedName.includes('.mp4')
        || matchedName.includes('.webm')
        || matchedName.includes('.pdf')
}

export const remarkOfWikilinksPlugin: Plugin<[remarkOfWikiLinkPluginOptions?], Root> = (options = {}) => {

    const {
        hrefTemplate = (pageName: string) => `/${pageName}`,
        pageResolver = (pageName: string) => pageName,
        class: className = 'internal'
    } = options;

    return (tree) => {
        findAndReplace(tree, [
            [
                ALL_REGEX,
                (match: string): any => {

                    console.log(`Matched: ${match}`);


                    const groups = new RegExp(ALL_REGEX).exec(match);
                    if (!groups) {
                        console.warn(`Could not parse link: ${match}`);
                        return {type: 'text', value: 'PARSING ERROR'}; // Fallback to plain text
                    }

                    const embed = groups[1] === '!';
                    const matchedName = groups[2] as string;
                    const heading = groups[3];
                    const alias = groups[4];

                    const resolvedPage = pageResolver(matchedName);
                    const sluggedHeading = pageResolver(heading)

                    if (embed) {
                        // Only for cross note embeds. Not for media yet
                        if (isMedia(matchedName)) {
                            return {
                                type: 'text',
                                value: `<<Oops, no media embeds yet>>`
                            }
                        }
                        const filePath = pathMap.get(resolvedPage ?? '');

                        if (filePath && heading) {
                            console.log(`Getting ${heading} from:`, filePath)
                            const content = extractSection(filePath, heading);
                            console.log(`Content:`, content)
                            return content?.content;
                        }

                        return {
                            type: 'text',
                            value: `<<Oops, something went wrong. Could not embed "${resolvedPage}" and Heading "${heading}">>`
                        }
                    }

                    const href = hrefTemplate(resolvedPage ?? '') + (sluggedHeading ? `#${sluggedHeading.toLowerCase()}` : '');

                    if (href === 'undefined') {
                        console.warn(`Could not resolve page: ${matchedName}`);

                        return {
                            type: 'html',
                            value: `<span class="not-resolved">${alias ?? matchedName}</span>`
                        };

                    }

                    return {
                        type: 'link',
                        url: href,
                        data:
                            {
                                hProperties: {
                                    class: className
                                }
                            },
                        children: [
                            {
                                type: 'text',
                                value: alias ?? matchedName
                            }
                        ]
                    };
                }
            ]
        ])
        ;
    }
}
