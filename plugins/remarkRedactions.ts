import {visitParents} from 'unist-util-visit-parents';
import type {Plugin} from 'unified';
import type {Node, Root} from 'mdast';
import type {InlineRedactionNode, RedactionNode} from "./util/mdast-custom";
import {findAndReplace, type FindAndReplaceTuple} from "mdast-util-find-and-replace";
import type {VFile} from "vfile";
import {parseInlineRedactionContent} from "./util/remarkRedactions-utils.ts";

const DEFAULT_REGEXP = /§(\d+)§(.*)§§/g
const REDACTION_START = /^§(\d+)§$/;
const REDACTION_END = /^§§$/;

/* The content could include other paragraphs, obsidian flavored markdown, other redactions or even images. These are
processed in another markdown plugin earlier in the pipeline.

The purpose of the markdown plugin should be only to mark where redactions should be placed and what they contain.
Determining if it should be shown and what is shown instead will be handled later by a preact component on the client
side.
*/

// https://gocardless.com/blog/fun-with-markdown-and-remark/

interface Redaction {
    startIndex: number, // Index of Parent of the marker under the Root
    endIndex: number,
    content: Node[],
    level: number
}

export const remarkRedactionsPlugin: Plugin<[], Root> = () => {
    function processTree(tree: Root, file: VFile) {

        if (!tree || !tree.children) {
            return tree;
        }

        const redactions: Redaction[] = [];
        let markerStack: { startIndex: number, level: number }[] = [];

        // Simplest Case: Redaction in a paragraph
        // Construct the replacer
        const replacer: FindAndReplaceTuple = [
            DEFAULT_REGEXP,
            (value, levelStr: string, content: string) => {
                // console.log("found:", value, '|', levelStr);
                const level = parseInt(levelStr, 10);
                return {
                    type: 'inlineRedaction',
                    level: level,
                    children: parseInlineRedactionContent(content, file)
                } as InlineRedactionNode;
            }
        ]

        // Execute
        findAndReplace(tree, replacer);

        // Handle Block Redactions
        visitParents(tree, 'text', (node, ancestors) => {
            // If a node is just a start marker, we can push it onto the stack
            if (REDACTION_START.test(node.value)) {
                const match = REDACTION_START.exec(node.value.trim());
                const level = parseInt(match?.[0] ?? '0')

                // current node parent under root
                const parent = ancestors[1];
                const startIndex = ancestors[0].children.findIndex((child) => child === parent);
                // Using the parent under the root as essentially all Parent Nodes are seperate under the Root, i.e. Headings, Tables, Paragraphs.
                // This might prevent Block Redactions from only redacting single table cells, but that's a sacrifice im willing to make.
                markerStack.push({startIndex, level});

                return
            }

            // If a node is just an end marker, we can pop the stack and create a redaction
            if (REDACTION_END.test(node.value) && markerStack.length > 0) {
                const startNode = markerStack.pop();
                if (!startNode) {
                    return;
                }

                const endNode = ancestors[1];
                const endIndex = ancestors[0].children.findIndex((child) => child === endNode);

                const content = ancestors[0].children.slice(startNode.startIndex + 1, endIndex);

                // Only add the redaction if it is a top level one (top of the nest)
                if (markerStack.length === 0) {
                    redactions.push({
                        startIndex: startNode.startIndex,
                        endIndex,
                        content,
                        level: startNode.level
                    })
                }
            }
        })

        // Reverse the redactions to ensure they are processed in an order that doesn't disrupt indexing
        redactions.sort((a, b) => a.startIndex - b.startIndex);


        if (markerStack.length > 0) {
            console.warn('[REDACTION WARN] Unmatched redaction markers found in the tree:', markerStack);
        }
        if (redactions.length === 0) {
            return tree; // No redactions found, return the tree as is
        }

        let reconTree: Root = {
            type: 'root',
            children: []
        }
        let idxPointer = 0

        // console.log('\n\n [REDACTIONS] Block Redactions found:', redactions, '\n\n');


        // Now we have all the redactions, we can reconstruct the in the tree with the Redaction nodes spliced in.
        redactions.forEach((redaction) => {
            const {startIndex, endIndex, content, level} = redaction;

            // Add nodes before current redaction
            reconTree.children.push(...tree.children.slice(idxPointer, startIndex));

            const tempRoot = {type: 'root', children: content} as Root;
            const processedContent = processTree(tempRoot, file).children;

            // Construct the new node
            const redactionNode: RedactionNode = {
                type: 'redaction',
                level,
                children: processedContent
            };

            // Add the node to the new tree
            reconTree.children.push(redactionNode);

            // set the pointer to the end of the current redaction
            idxPointer = endIndex + 1; // +1 to skip the end marker
        })

        // Add any remaining nodes after the last redaction
        reconTree.children.push(...tree.children.slice(idxPointer));

        return reconTree;
    }

    return (tree: Root, file: VFile) => {
        return processTree(tree, file);
    }
}
