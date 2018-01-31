import React, { Component } from 'react';
import troubleIconComponent from './troubleIconComponent';

export default function troublesComponent(troubles) {
    return (
        <div>
            {troubles.map(troubleIconComponent)}
        </div>
    );
}

