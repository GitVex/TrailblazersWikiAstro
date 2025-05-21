import type {FunctionalComponent} from "preact";
import {isAuthed} from "./stores/UserStateStore.ts";

interface ContentProps {
    slug: string
    slugMap: Record<string, any>,
    children?: any,
}

const Content: FunctionalComponent<ContentProps> = (props) => {
    const {slug: key, slugMap, children} = props

    return (isAuthed(slugMap[key]?.allowedUsers)) ? (
        <div>
            {children}
        </div>
    ) : (
        <p>Seems like you aren't suppose to see this ... yet.</p>
    )
};

export default Content;
