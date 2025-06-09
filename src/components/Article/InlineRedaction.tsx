interface InlineRedactionProps {
    level: number;
    children: any;
}

export function InlineRedaction(props: InlineRedactionProps) {
    return (
        <p class="redaction" data-level={props.level}>
            {props.children}
        </p>
    )
}
