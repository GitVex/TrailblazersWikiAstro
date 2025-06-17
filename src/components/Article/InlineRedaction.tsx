import {isElevated} from "../stores/UserStateStore.ts";

interface InlineRedactionProps {
    level: number;
    children: any;
}

export function InlineRedaction({children, level}: InlineRedactionProps) {
    if (children === undefined) {
        return null;
    }

    // find metadata element from document root with id "secinfo"
    const secinfo = document.getElementById('secinfo');
    const elevatedUsers = JSON.parse(secinfo?.getAttribute('data-elevatedUsers') || '{}')

    return (
        <>
            {
                isElevated(elevatedUsers, level, true) ? (
                        children
                    ) :
                    children.props.children[0].replace(/\S/g, '█')
            }
        </>
    )
}
