import Preact from 'preact';

export function Redaction() {
    return (
        <Preact.Fragment>
            <p>
                <slot/>
            </p>
        </Preact.Fragment>
    )
}
