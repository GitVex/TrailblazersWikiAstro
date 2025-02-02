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
const ALL_REGEX = /(!?)\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^\]]+))?]]/g;

type remarkOfWikiLinkPluginOptions = {
    hrefTemplate?: (pageName: string) => string;
    pageResolver?: (pageName: string) => string | null;
    class?: string;
};

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
                        return { type: 'text', value: 'PARSING ERROR' }; // Fallback to plain text
                    }

                    const embed = groups[1] === '!';
                    const matchedName = groups[2] as string;
                    const heading = groups[3];
                    const alias = groups[4];

                    // TODO: Implement embeds
                    if (embed) {
                        console.warn(`Escaping Embed: ${match}`);
                        return { type: 'text', value: match }; // Fallback to plain text for embeds, needs to be supported
                    }

                    const resolvedPage = pageResolver(matchedName);
                    if (!resolvedPage) {
                        console.warn(`Could not resolve page: ${matchedName}`);
                        return { type: 'text', value: `COULD NOT RESOLVE` }; // Fallback to plain text
                    }

                    const href = hrefTemplate(resolvedPage ?? '') + (heading ? `#${heading.toLowerCase()}` : '');

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
