// ofwikiLinks.ts
import getRouteMap from "./dynamicWikiLinks.ts";}

interface ofWikiLinksPluginOpts {
    aliasDivider?: string
    pageResolver?: (name: string) => string
    hrefTemplate?: (slug: string) => string
    this: any
}

/**
 * Match group breakdown:
 *  1.  Optional “!” for embedding
 *  2.  File/page name (anything not #, |, or ] allowed)
 *  3.  Optional heading after "#"
 *  4.  Optional alias after "|"
 */
const ALL_LINK_REGEX = /^(!?)\[\[([^#|\]]+)(?:#([^\|]+))?(?:\|([^\]]+))?\]\]/;

// const DEFAULT_LINK_REGEX = /^\[\[(.+?)\]\]/;

function locator(value: string, fromIndex: number): number {
    return value.indexOf('[', fromIndex);
}

export function ofWikiLinksPlugin(this: any, opts = {} as ofWikiLinksPluginOpts) {
    // Construct Route Map
    const slugToRoute = getRouteMap();

    // Getting alias divider
    const aliasDivider = opts.aliasDivider || '|';

    // Getting page Resolver
    const pageResolver = opts.pageResolver || ((name: string) => [
        name.replace(/ /g, '-')
            .toLowerCase()
            .replace('\\', '')
    ])

    // Getting href template for regular links
    const hrefTemplate = opts.hrefTemplate || ((slug: string) =>
            slugToRoute.get(slug)?.concat('/', slug)
                .replace(/ /g, '-')
                .toLowerCase()
                .replace('\\', '')
    )

    // Parse
    function parseWikiLink(link: string): {
        fullMatch: string,
        embed: boolean,
        name: string,
        heading?: string,
        alias?: string
    } {
        // Match the link
        const match = link.match(ALL_LINK_REGEX);
        if (!match) {
            return {fullMatch: "", embed: false, name: link};
        }
        // Get embed
        const embed = match[1] === '!';
        // Get name
        const name = match[2];
        // Get heading
        const heading = match[3];
        // Get alias
        const alias = match[4];

        return {fullMatch: match[0], embed, name, heading, alias};
    }

    function inlineTokenizer(eat: any, value: string) {
        const match = value.match(ALL_LINK_REGEX);
        if (!match) {
            return
        }

        const {fullMatch, embed, name, heading, alias} = parseWikiLink(value);

        return eat(fullMatch)({
            type: 'wikiLink',
            value: name,
            data: {
                alias,
                embed,
                heading,
                hName: 'a',
                hProperties: {
                    className: 'internal',
                    href: hrefTemplate(name)
                }
            },
            hChildren: [{type: 'text', value: name}]
        })
    }

    // Attach locator to tokenizer
    inlineTokenizer.locator = locator;

    // Register tokenizer with parser
    const Parser = this.Parser;
    if (!Parser) return
    const inlineTokenizers = Parser.prototype.inlineTokenizers;
    const inlineMethods = Parser.prototype.inlineMethods;
    inlineTokenizers.wikiLink = inlineTokenizer;
    inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'wikiLink');

    // Add compiler visitor if a compiler is available
    const Compiler = this.Compiler;
    if (!Compiler) return

    const visitors = Compiler.prototype.visitors;
    if (!visitors) return
    visitors.wikiLink = function (node: any) {
        let reconstructedLink = ""

        // reconstruct the link
        // if embedded, add "!"
        if (node.data.embed) {
            reconstructedLink += "!";
        }

        // add the link name
        reconstructedLink += "[[" + node.value;

        // if heading, add "#" + heading
        if (node.data.heading) {
            reconstructedLink += "#" + node.data.heading;
        }

        // if alias, add "|" + alias
        if (node.data.alias) {
            reconstructedLink += "|" + node.data.alias;
        }

        // close the link
        reconstructedLink += "]]";

        return reconstructedLink;
    }
}
