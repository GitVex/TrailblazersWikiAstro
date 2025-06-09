interface RedactionProps {
    level: number,
    children: any;
}

export function Redaction(props: RedactionProps) {
    return (
        <div class="redaction" data-level={props.level}>
            {props.children}
        </div>
    )
}
