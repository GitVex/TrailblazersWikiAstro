import { findAndReplace } from 'mdast-util-find-and-replace';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

export const remarkOfMediaLinksPlugin: Plugin<[], Root> = () => {
    return (tree: Root) => {
        findAndReplace(tree, [
            // Match Obsidian embeds and replace with Markdown images
            [
                /!\[\[([^\]]+\.(?:jpg|png|gif|pdf|svg))\]\]/g,
                (match: string) => {
                    const fileName = match.replace(/!\[\[|\]\]/g, '');
                    return {
                        type: 'text',
                        value: `![${fileName}](${fileName})`
                    };
                }
            ]
        ]);
    };
};
