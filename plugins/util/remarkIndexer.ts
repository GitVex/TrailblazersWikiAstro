import {visit} from "unist-util-visit";
import type {Plugin} from "unified";
import type {Node, Root} from "mdast";

interface RemarkIndexerOptions {

}

export const remarkIndexerPlugin: Plugin<[RemarkIndexerOptions], Root> = (tree: Root) => {
    return (tree: Root) => {
        let counter = 0

        visit(tree, (node, index, parent) => {
            (node as any).index = counter++;
        });
    };
}
