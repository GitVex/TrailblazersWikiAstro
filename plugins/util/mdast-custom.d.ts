// mdast-custom.d.ts

import type { Node } from 'unist'; // Or `import type { Literal } from 'mdast'` if more appropriate

/**
 * Interface for your custom 'redaction' MDAST node.
 * It holds the necessary information for later processing on the client-side.
 */
export interface RedactionNode extends Node { // Or `Literal`
    type: 'redaction';
    level: string;   // The redaction level
    content: string; // The original content that is redacted
}

// Augment the 'mdast' module to make it aware of 'RedactionNode'
declare module 'mdast' {
    /**
     * Augment the PhrasingContentMap to include 'redaction'.
     * This tells utilities like mdast-util-find-and-replace that
     * 'redaction' is a valid inline content type.
     */
    interface PhrasingContentMap {
        redaction: RedactionNode; // map 'redaction' type string to RedactionNode interface
    }
}