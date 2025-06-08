import type {VFile} from "vfile";
import type {PhrasingContent} from "mdast";
import type {InlineRedactionNode} from "./mdast-custom";

// Helper function to recursively parse content for inline redactions
export function parseInlineRedactionContent(text: string, file: VFile): PhrasingContent[] {
    const nodes: PhrasingContent[] = [];
    let lastIndex = 0;
    const inlineRegex = /§(\d+)§(.*)§§/g;
    let match;

    // Trim the input text initially to avoid leading/trailing empty text nodes from outer trims.
    const trimmedText = text.trim();
    if (trimmedText === '') {
        return [];
    }


    while ((match = inlineRegex.exec(trimmedText)) !== null) {
        const [fullMatch, levelStr, innerContent] = match;
        const level = parseInt(levelStr, 10);

        // Add text before the match
        if (match.index > lastIndex) {
            nodes.push({type: 'text', value: trimmedText.substring(lastIndex, match.index)});
        }

        // Recursively parse the inner content
        const parsedInnerContent = parseInlineRedactionContent(innerContent, file); // Recursive call

        nodes.push({
            type: 'inlineRedaction',
            level: level,
            children: parsedInnerContent.length > 0 ? parsedInnerContent : [{type: 'text', value: '[REDACTED]'}],
            data: {
                hName: 'inline-redaction'
            }
        } as InlineRedactionNode);

        lastIndex = inlineRegex.lastIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < trimmedText.length) {
        nodes.push({type: 'text', value: trimmedText.substring(lastIndex)});
    }

    // If nodes is still empty, it means the original trimmedText had no redaction patterns.
    // In this case, the trimmedText itself is the content.
    if (nodes.length === 0 && trimmedText.length > 0) {
        return [{type: 'text', value: trimmedText}];
    }

    return nodes;
}
