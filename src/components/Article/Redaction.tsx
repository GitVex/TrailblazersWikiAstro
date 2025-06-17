import {isElevated} from "../stores/UserStateStore.ts";
import type {elevatedUserList} from "../../../plugins/remark/util/remarkOfWikiLinks-utils.ts";
import {Children} from "preact/compat";

interface RedactionProps {
    level: number,
    children: any;
}

function redactContent(secinfo: elevatedUserList, level: number, content: any): any {
    return Children.map(content, (child: any): any => {
        if (typeof child === 'string') {
            return isElevated(secinfo, level, true) ? child : child.replace(/\S/g, '█');
        } else if (child.props && child.props.children) {

            const {children, ...rest} = child.props;

            return {
                ...child,
                props: {
                    ...rest,
                    children: redactContent(secinfo, level, children)
                }
            };
        }
        return child;
    });
}

export function Redaction(props: RedactionProps) {

    // find metadata element from document root with id "secinfo"
    const secinfo = document.getElementById('secinfo');
    const elevatedUsers = JSON.parse(secinfo?.getAttribute('data-elevatedUsers') || '{}')


    return (
        <div class="redaction" data-level={props.level}>
            {redactContent(elevatedUsers, props.level, props.children)}
        </div>
    )
}
