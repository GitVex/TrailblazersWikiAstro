import fs from 'fs';
import path from 'path';
import wikiLinkPlugin from 'remark-wiki-link';

/** Recursively gather all .md/.mdx files in src/content */
function getAllMarkdownFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });

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
    // e.g. "Folder/My File.md"
    // remove extension:
    const withoutExt = relative.replace(/\.(md|mdx)$/, '');
    // e.g. "Folder/My File"
    // turn spaces into dashes if you want:
    const dashed = withoutExt.replace(/\s+/g, '-');
    // e.g. "Folder/My-File"
    // build your route:
    return `/content/${dashed}`;
}

export default function dynamicWikiLinks() {
    // 1. Gather all .md/.mdx paths
    const allMarkdownPaths = getAllMarkdownFiles(path.join(process.cwd(), 'src/content'));

    // 2. Build a map: { slug -> route }
    const slugToRoute = new Map();
    for (const filePath of allMarkdownPaths) {
        const slug = filePathToSlug(filePath);
        const route = filePathToRoute(filePath);
        slugToRoute.set(slug, route);
    }

    // 3. Return the plugin config for remark-wiki-link
    return () => [
        wikiLinkPlugin,
        {
            aliasDivider: '|',
            inlineLink: true,
            // This is how the plugin transforms "[[Some Name]]" to a slug:
            // e.g. "Some Name" => "some-name"
            pageResolver: (name: string) => [name.replace(/\s+/g, '-').toLowerCase()],
            // Then we use that slug to look up the correct route from slugToRoute.
            hrefTemplate: (slug: string) => slugToRoute.get(slug) ?? `/content/not-found/${slug}`,
        },
    ];
}
