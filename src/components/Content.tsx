import {type FunctionalComponent} from "preact";
import {isAuthed} from "./stores/UserStateStore.ts";
import register from 'preact-custom-element'
import {InlineRedaction} from "./Article/InlineRedaction.tsx";
import {Redaction} from "./Article/Redaction.tsx";
import type {SlugMap} from "../../plugins/remark/util/remarkOfWikiLinks-utils.ts";

interface ContentProps {
    slug: string
    slugMap: SlugMap,
    children?: any,
}

// define('inline-redaction', () => InlineRedaction)
// define('block-redaction', () => Redaction)

register(InlineRedaction, 'inline-redaction')
register(Redaction, 'block-redaction')

const Content: FunctionalComponent<ContentProps> = (props) => {
    const {slug: key, slugMap, children} = props

    return (isAuthed(slugMap[key]?.allowedUsers)) ? (
        <div>
            {children}
            <metadata id="secinfo" data-elevatedUsers={JSON.stringify(slugMap[key]?.elevatedUsers)}></metadata>
        </div>
    ) : (
        <p>Seems like you aren't suppose to see this ... yet.</p>
    )
};

export default Content;
