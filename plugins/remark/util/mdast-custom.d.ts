// mdast-custom.d.ts

import type {Node, Parent} from 'unist';
import type {Literal, PhrasingContent} from "mdast"; // Or `import type { Literal } from 'mdast'` if more appropriate

/**
 * Interface for your custom 'redaction' MDAST node.
 * It holds the necessary information for later processing on the client-side.
 */
export interface RedactionNode extends Parent {
    type: 'redaction';
    children: Node[]; // The original content that is redacted
    data: {
        hName: string, hProperties: {
            level: number;
        }
    }
}

export interface InlineRedactionNode extends Literal {
    type: 'inlineRedaction';
    children: PhrasingContent[];
    data: {
        hName: string, hProperties: {
            level: number;
        }
    }
}

// Augment the 'mdast' module to make it aware of 'RedactionNode'
declare module 'mdast' {
    /**
     * Augment the RootContentMap to include 'redaction'.
     * This tells utilities like mdast-util-find-and-replace that
     * 'redaction' is a valid inline content type.
     */
    interface RootContentMap {
        redaction: RedactionNode,
        inlineRedaction: InlineRedactionNode
    }

    interface PhrasingContentMap {
        inlineRedaction: InlineRedactionNode
    }
}
