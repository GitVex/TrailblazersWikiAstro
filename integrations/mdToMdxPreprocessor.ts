import fs from 'fs/promises';
import path from 'path';
import {glob} from 'glob';
import chokidar from 'chokidar';

async function processMarkdown(filePath: string, type: 'block' | 'inline') {
    const projectRoot = process.cwd();
    const contentDir = path.resolve(projectRoot, 'src/content');
    const componentPath = path.relative(path.dirname(filePath), path.resolve(projectRoot, `src/components/Article/${type === 'inline' ? 'Inline' : ''}Redaction.tsx`));

    let content = await fs.readFile(filePath, 'utf-8');

    const importStatement = `import ${type === 'inline' ? 'Inline' : ''}Redaction from '${componentPath}';\n`;
    content = content.replace(/(---[\s\S]*?---)/, `$1\n${importStatement}`);


}