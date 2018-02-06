import * as React from 'react';
import { calculateLifeTime } from '../utils';

export default function lifetimeComponent(lifetime: number) {
    const data = calculateLifeTime(lifetime);

    return <span>
        {data.d ? (data.d + ' d ') : undefined }
        {data.h ? (data.h + ' h ') : undefined }
        {data.m ? (data.m + ' m ') : undefined }
    </span>;
}
