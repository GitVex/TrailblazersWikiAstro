import { findAndReplace } from 'mdast-util-find-and-replace';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

const IMG_REGEX = /!\[\[([^\]]+\.(?:jpg|png|gif|pdf|svg))]]/g

export const remarkOfMediaLinksPlugin: Plugin<[], Root> = () => {

    return (tree: Root) => {
        findAndReplace(tree, [
            [
                IMG_REGEX,
                (match: string) => {

                    const groups = new RegExp(IMG_REGEX).exec(match);
                    if (!groups) {
                        // console.warn(`[PROCESSOR] Could not parse link: ${match}`);
                        return {type: 'text', value: 'PARSING ERROR'};
                    }

                    const fileName = groups[1];

                    return {
                        type: 'image',
                        url: `/src/images/${fileName}`,
                        data: {hProperties: {class: 'image-embed'}}
                    }
                }
            ]
        ]);
    };
};
