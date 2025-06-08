export function InlineRedaction(props) {
    return (
        <p data-level={props.level}>
            {props.children}
        </p>
    )
}
