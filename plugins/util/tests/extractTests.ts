import {extractSection, getPathMap } from "../remarkOfWikiLinks-utils.ts";

const pathMap = getPathMap();

const slugs = [
    'al-rabata',
    'charenet-driveyards',
    'the-crater-oasis'
]

const headings = [
    'Description',
    'Profile'
]

for (const slug of slugs) {
    const filePath = pathMap.get(slug);
    if (filePath) {
        for (const heading of headings) {
            const section = extractSection(filePath, heading);
            console.log(`${heading} in ${slug}`, section);
        }
    }
}
