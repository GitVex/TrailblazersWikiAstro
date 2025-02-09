import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import type { Parent } from 'unist';
import type {Heading, Root, RootContent, Node} from 'mdast';
import slugify from "voca/slugify";
import {deprecate} from "node:util";
import remarkGfm from "remark-gfm";

interface HeadingContent {
    heading: string;
    content: string | Parent;
}

/**
 * Interface representing information about a slug.
 */
interface SlugInfo {
    /** The name of the slug. */
    name: string;
    /** The route associated with the slug. */
    route: string;
    /** The file path of the slug. */
    filePath: string;
}

/**
 * Interface representing a map of slugs to their information.
 */
export interface SlugMap {
    [slug: string]: SlugInfo;
}

export function getSlugMap(): SlugMap {
    const allMarkdownPaths = getAllMarkdownFiles(path.join(process.cwd(), 'src/content'));
    const slugMap: SlugMap = {};

    for (const filePath of allMarkdownPaths) {
        const slug = filePathToSlug(filePath);
        const relativePath = path.dirname(path.relative(path.join(process.cwd(), 'src/content'), filePath));
        const route = '/content/' + relativePath.split('\\').map(slugify).join('/').concat('/', slug)

        slugMap[slug] = {
            name: path.basename(filePath, path.extname(filePath)),
            route: route,
            filePath: filePath
        };
    }

    return slugMap;
}

/** Recursively gather all .md/.mdx files in src/content */
function getAllMarkdownFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir, {withFileTypes: true});

    for (const dirent of list) {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
            results = results.concat(getAllMarkdownFiles(fullPath));
        } else if (/\.(md|mdx)$/.test(dirent.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * From a file path, generate the “slug” that the wikiLink plugin will look for.
 * For example, `src/content/Folder/My File.md` => `my-file`.
 * You can customize this logic to match your real desired slug rules.
 */
export function filePathToSlug(filePath: string) {
    const base = path.basename(filePath, path.extname(filePath)); // "My File"
    return slugify(base) // "my-file"
}
/**
 * Converts a slug to a file name.
 * @deprecate Use the name attribute of the SlugMap instead
 * @param slug The slug to convert.
 * @returns The formatted file name.
 */
export function slugToFileName(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * From a file path, generate the folder that the file should be part of.
 * For example:
 *   src/content/Folder/My File.md => /content/Folder/
 */
export function filePathToRoute(filePath: string) {
    // Get the relative path under "src/content"
    const relative = path.relative(path.join(process.cwd(), 'src/content'), filePath);

    // Remove file extension
    const route = relative.replace(/\.(md|mdx)$/, '');

    return `/content/${route}`;
}

/**
 * Extracts the content under a specific heading in a Markdown file.
 * @param markdown The Markdown content as a string.
 * @param targetHeading The exact text of the heading to search for.
 * @returns An object with the heading text and its content, or null if not found.
 */
function extractHeadingContent(markdown: string, targetHeading: string): HeadingContent | null {
    const parseProcessor = unified().use(remarkParse).use(remarkGfm);
    const tree = parseProcessor.parse(markdown) as Root;

    let found = false;
    let targetDepth = 0;
    const contentNodes: RootContent[] = [];

    visit(tree, (node, index, parent: Parent | null) => {
        if (node.type === 'heading') {
            const headingNode = node as Heading;
            const headingText = toString(headingNode).trim();
            if (headingText === targetHeading && !found && parent) {
                found = true;
                targetDepth = headingNode.depth;
                const children = parent.children;
                let currentIndex = index! + 1;
                while (currentIndex < children.length) {
                    const sibling: Node = children[currentIndex];
                    if (sibling.type === 'heading' && (sibling as Heading).depth <= targetDepth) {
                        break;
                    }
                    // ignore thematic breaks
                    if (sibling.type === 'thematicBreak') {
                        currentIndex++;
                        continue;
                    }
                    contentNodes.push(sibling as RootContent);
                    currentIndex++;
                }
            }
        }
    });

    if (!found) return null;

    const contentTree: Parent = { type: 'blockquote', children: contentNodes };

    return { heading: targetHeading, content: contentTree };
}

/**
 * Reads a Markdown file and extracts content under the specified heading.
 * @param filePath Path to the Markdown file.
 * @param targetHeading Exact text of the heading to extract.
 * @returns Extracted content or null if not found.
 */
export function extractSection(filePath: string, targetHeading: string): HeadingContent | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractHeadingContent(content, targetHeading);
}
