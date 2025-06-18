import {type FunctionalComponent} from "preact";
import {isAuthed} from "./stores/UserStateStore.ts";
import register from 'preact-custom-element'
import {InlineRedaction} from "./Article/InlineRedaction.tsx";
import {Redaction} from "./Article/Redaction.tsx";
import type {SlugInfo, SlugMap} from "../../plugins/remark/util/remarkOfWikiLinks-utils.ts";

interface ContentProps {
    slug: string
    slugInfo: SlugInfo,
    children?: any,
}

register(InlineRedaction, 'inline-redaction')
register(Redaction, 'block-redaction')

const Content: FunctionalComponent<ContentProps> = (props) => {
    const {slug: key, slugInfo, children} = props

    console.log(slugInfo)

    return (isAuthed(slugInfo.allowedUsers)) ? (
        <div>
            {children}
            <metadata id="secinfo" data-elevatedUsers={JSON.stringify(slugInfo.elevatedUsers)}></metadata>
        </div>
    ) : (
        <p>Seems like you aren't suppose to see this ... yet.</p>
    )
};

export default Content;
