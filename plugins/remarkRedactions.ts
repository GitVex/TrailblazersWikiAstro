import {findAndReplace} from "mdast-util-find-and-replace";
import type {Plugin} from 'unified';
import type {Root, Text, Parent, RowContent } from 'mdast';
import type {RedactionNode} from './util/mdast-custom'

const DEFAULT_REGEXP = /§(\d+)§(.*?)§§/g


interface remarkRedactionsOptions {
    redactionRegex?: RegExp;
}

/* The content could include other paragraphs, obsidian flavored markdown, other redactions or even images. These are
processed in another markdown plugin earlier in the pipeline.

The purpose of the markdown plugin should be only to mark where redactions should be placed and what they contain.
Determining if it should be shown and what is shown instead will be handled later by a preact component on the client
side.
*/

// https://gocardless.com/blog/fun-with-markdown-and-remark/

export const remarkRedactionsPlugin: Plugin<[remarkRedactionsOptions], Root> = (options) => {
    const {redactionRegex = DEFAULT_REGEXP} = options;

    function processTree(tree: Root) {

        const replacer = (
            fullMatch: string,      // The entire matched string, e.g., "§1§secret text§§"
            level: string,          // Content of the first capture group, e.g., "1"
            content: string,        // Content of the second capture group, e.g., "secret text"
        ): RedactionNode | Text => {
            // Basic check (though findAndReplace usually ensures groups are there if regex matches)
            if (level === undefined || content === undefined) {
                console.warn(`[remarkRedactionsPlugin] Could not extract groups from match: "${fullMatch}"`);
                return {type: 'text', value: `[PARSING ERROR: ${fullMatch}]`};
            }

            return {
                type: 'redaction',
                level: level,
                content: content
            };
        };

        findAndReplace(tree, [redactionRegex, replacer]);
    }


    return (tree: Root) => {
        processTree(tree);
    }
}