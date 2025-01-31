import type {Plugin} from 'unified';
import type {Root} from 'mdast';
import {findAndReplace} from "mdast-util-find-and-replace";

/**
 * Match group breakdown:
 *  1.  Optional “!” for embedding
 *  2.  File/page name (anything not #, |, or ] allowed)
 *  3.  Optional heading after "#"
 *  4.  Optional alias after "|"
 */
const ALL_REGEX = /(!?)\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^]]+))?]]/g;

type remarkOfWikiLinkPluginOptions = {
    hrefTemplate?: (pageName: string) => string;
    pageResolver?: (pageName: string) => string | null;
    slugify?: (input: string) => string;
    class?: string;
};

export const remarkOfWikilinksPlugin: Plugin<[remarkOfWikiLinkPluginOptions?], Root> = (options = {}) => {

    const {
        hrefTemplate = (pageName: string) => `/${pageName}`,
        pageResolver = (pageName: string) => pageName,
        slugify = (input: string) => input.replace(/\s+/g, '-')
            .toLowerCase()
            .replace('\\', ''),
        class: className = 'internal'
    } = options;

    return (tree) => {
        findAndReplace(tree, [
            [
                ALL_REGEX,
                (match: string[]): any => {
                    const embed = match[1] === '!';
                    const matchedName = match[2] as string;
                    const heading = match[3];
                    const alias = match[4];

                    const resolvedPage = pageResolver(matchedName);
                    if (!resolvedPage) {
                        console.warn(`Could not resolve page: ${matchedName}`);
                        return { type: 'text', value: `[[${matchedName}]]` }; // Fallback to plain text
                    }

                    const slug = slugify(resolvedPage);
                    const href = hrefTemplate(slug ?? '') + (heading ? `#${heading}` : '');

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
        ]);
    }
}
