import * as React from 'react';
import troubleIconComponent from './troubleIconComponent';

export default function troublesComponent(troubles: string[]) {
    return <div>
        {troubles.map(troubleIconComponent)}
    </div>;
}
