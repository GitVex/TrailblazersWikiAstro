import fs from 'fs';
import path from 'path';

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
function filePathToSlug(filePath: string) {
    const base = path.basename(filePath, path.extname(filePath)); // "My File"
    return base.replace(/\s+/g, '-').toLowerCase(); // "my-file"
}

/**
 * From a file path, generate the actual URL that your site should link to.
 * For example:
 *   src/content/Folder/My File.md => /content/Folder/My-File
 * Again, adjust to match your site’s actual route structure.
 */
function filePathToRoute(filePath: string) {
    // Get the relative path under "src/content"
    const relative = path.relative(path.join(process.cwd(), 'src/content'), filePath);
    // Folder\\My File.md
    // remove filename
    const folder = path.dirname(relative);

    // e.g. "Folder/my-file"
    // build your route:
    return `/content/${folder}`;
}

/**
 * Returns a map of slugs to routes.
 *
 * **/
export default function getRouteMap() {
    // 1. Gather all .md/.mdx paths
    const allMarkdownPaths = getAllMarkdownFiles(path.join(process.cwd(), 'src/content'));

    // 2. Build a map: { slug -> route }
    const slugToRoute: Map<string, string> = new Map();
    for (const filePath of allMarkdownPaths) {
        const slug = filePathToSlug(filePath);
        const route = filePathToRoute(filePath);
        slugToRoute.set(slug, route);
    }

    console.log(slugToRoute);

    // 3. Return the plugin config for remark-wiki-link
    return slugToRoute
}
