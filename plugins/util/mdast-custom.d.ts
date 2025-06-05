// mdast-custom.d.ts

import type {Parent} from 'unist';
import type {Literal, Text} from "mdast"; // Or `import type { Literal } from 'mdast'` if more appropriate
import type {Node} from 'unist';

/**
 * Interface for your custom 'redaction' MDAST node.
 * It holds the necessary information for later processing on the client-side.
 */
export interface RedactionNode extends Parent {
    type: 'redaction';
    level: number;   // The redaction level
    children: Node[]; // The original content that is redacted
}

export interface InlineRedactionNode extends Literal {
    type: 'inlineRedaction';
    level: number;
    children: Text;
}

// Augment the 'mdast' module to make it aware of 'RedactionNode'
declare module 'mdast' {
    /**
     * Augment the RootContentMap to include 'redaction'.
     * This tells utilities like mdast-util-find-and-replace that
     * 'redaction' is a valid inline content type.
     */
    interface RootContentMap {
        redaction: RedactionNode; // map 'redaction' type string to RedactionNode interface
    }

    interface PhrasingContentMap{
        inlineRedaction: InlineRedactionNode
    }
}
