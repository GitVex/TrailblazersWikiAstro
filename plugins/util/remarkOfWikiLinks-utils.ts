import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import type { Parent } from 'unist';
import type {Heading, Root, RootContent, Node} from 'mdast';

interface HeadingContent {
    heading: string;
    content: string | Parent;
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
    return base.replace(/\s+/g, '-').toLowerCase(); // "my-file"
}

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
    // console.log(relative);

    // Folder\\My File.md
    // remove filename
    const folder = path.dirname(relative).replace(/\\/g, '/');
    // console.log(folder);

    // e.g. "Folder/my-file"
    // build your route:
    return `/content/${folder}`;
}

/**
 * Returns a map of slugs to routes.
 * Given a slug, you get the route which serves it's content.
 * **/
export function getRouteMap() {
    // 1. Gather all .md/.mdx paths
    const allMarkdownPaths = getAllMarkdownFiles(path.join(process.cwd(), 'src/content'));

    // 2. Build a map: { slug -> route }
    const slugToRoute: Map<string, string> = new Map();
    for (const filePath of allMarkdownPaths) {
        const slug = filePathToSlug(filePath);
        const route = filePathToRoute(filePath).toLowerCase().replace(' ', '-');
        slugToRoute.set(slug, route);
    }

    // 3. Return the plugin config for remark-wiki-link
    return slugToRoute
}

/**
 * Returns a map of slugs to file paths.
 * Given a slug, you get the file path of the markdown file.
 */
export function getPathMap() {
    // Gather all .md/.mdx paths and build a map: { slug -> path }
    const allMarkdownPaths = getAllMarkdownFiles(path.join(process.cwd(), 'src/content'));

    const slugToPath: Map<string, string> = new Map();
    for (const filePath of allMarkdownPaths) {
        const slug = filePathToSlug(filePath);
        slugToPath.set(slug, filePath);
    }

    return slugToPath;
}

/**
 * Extracts the content under a specific heading in a Markdown file.
 * @param markdown The Markdown content as a string.
 * @param targetHeading The exact text of the heading to search for.
 * @returns An object with the heading text and its content, or null if not found.
 */
function extractHeadingContent(markdown: string, targetHeading: string): HeadingContent | null {
    const parseProcessor = unified().use(remarkParse);
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

    // const stringifyProcessor = unified().use(remarkStringify);
    const contentTree: Parent = { type: 'blockquote', children: contentNodes };
    // const content = stringifyProcessor.stringify(contentTree).trim();

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
