import * as React from 'react';

export default function loeComponent(time: number) {
    return <span>{(time / 60 / 6).toFixed(2)}</span>;
}
