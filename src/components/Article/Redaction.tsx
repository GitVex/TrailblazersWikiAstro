import {isElevated} from "../stores/UserStateStore.ts";
import type {elevatedUserList} from "../../../plugins/remark/util/remarkOfWikiLinks-utils.ts";
import {Children, useEffect} from "preact/compat";
import {useRef} from "preact/hooks";

interface RedactionProps {
    level: number,
    children: any;
}

function redactContent(elevated: boolean, level: number, content: any, depth = 0): any {
    // console.log(depth, content)

    return Children.map(content, (child: any): any => {
        if (typeof child === 'string') {
            return elevated ? child : child.replace(/\S/g, '█');
        } else if (child.props && child.props.children) {

            const {children, ...rest} = child.props;

            return {
                ...child,
                props: {
                    ...rest,
                    children: redactContent(elevated, level, children, depth + 1)
                }
            };
        }
    });
}

export function Redaction({children, level}: RedactionProps) {
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
    const elevated = isElevated(elevatedUsers, level, true)

    // console.log('Redaction', level, elevatedUsers, children)

    return (
        <div class={elevated ? "" : "redacted"} data-level={level} ref={selfRef}>
            {redactContent(elevated, level, children)}
        </div>
    )
}
