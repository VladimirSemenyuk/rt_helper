import * as React from 'react';

export default function chatWithSlackComponent(owner: string) {
    return <a href={`slack://user?id=D8T0CKKNE&team=iponweb`}>{owner}</a>;
}
