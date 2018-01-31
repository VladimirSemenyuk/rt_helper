import React, { Component } from 'react';

export default function loeComponent(time) {
    return <span>{(parseInt(time, 10) / 60 / 6).toFixed(2)}</span>
}