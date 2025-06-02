// Write the current AST to a file in "C:\...\WebstormProjects\TrailblazersWikiAstro\plugins\util\AST_logs\" for
// debugging purposes.
// Only do this for the file "Danube Research Corporation.md"
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from "node:url";
import {VFile} from "vfile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function remarkASTLogger(options?: { incremental?: boolean, index: number }) {
    return (tree: any, file: VFile) => {
        // get the current article title
        let title = file?.basename
        if (title !== 'Danube Research Corporation.md') {
            return tree;
        }

        const fileName = `${title}_debug_tree_${options?.index}.md.ast.json`


        // Define the file path where you want to save the AST
        const filePath = path.join(__dirname, 'AST_logs', fileName);

        // Write the AST to a file
        fs.writeFileSync(filePath, JSON.stringify(tree, null, 2), 'utf8');

        console.log(`AST logged to ${filePath}`);

        return tree;
    };
}