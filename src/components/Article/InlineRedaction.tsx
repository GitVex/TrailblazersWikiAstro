import {isElevated} from "../stores/UserStateStore.ts";
import {useEffect} from "preact/compat";
import {useRef} from "preact/hooks";

interface InlineRedactionProps {
    level: number;
    children: any;
}

export function InlineRedaction({children, level}: InlineRedactionProps) {
    // ----- Sibling removal -----
    const selfRef = useRef(null)
    useEffect(() => {
        if (selfRef.current) {
            //@ts-ignore
            const parent = selfRef.current.parentElement;
            if (parent) {
                const childrenToRemove = Array.from(parent.childNodes);

                childrenToRemove.forEach(child => {
                        if (child !== selfRef.current) {
                            parent.removeChild(child);
                        }
                    }
                );
            }
        }
    }, [selfRef])
    // ---------------------------


    if (children === undefined) {
        return null;
    }

    // find metadata element from document root with id "secinfo"
    const secinfo = document.getElementById('secinfo');
    const elevatedUsers = JSON.parse(secinfo?.getAttribute('data-elevatedUsers') || '{}')
    const elevated = isElevated(elevatedUsers, level)

    return (
        <span class={elevated ? "" : "redacted"} ref={selfRef}>
            {
                elevated ? (
                        children
                    ) :
                    children.props.children[0].replace(/\S/g, '█')
            }
        </span>
    )
}
