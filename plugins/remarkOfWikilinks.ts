import type {Plugin} from 'unified';
import type {Root} from 'mdast';
import {findAndReplace} from "mdast-util-find-and-replace";

// small regex \[\[(.*?)\]\]
// all regex (!?)\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^]]+))?\]\]



export const remarkOfWikilinksPlugin: Plugin<[], Root> = () => (tree) => {
    findAndReplace(tree, [
        [
            /\[\[(.*?)\]\]/g],
            (match: string): any => {

                return {
                    type: 'wikiLink',
                    value: match,
                };
        }],
}
)
;
}
