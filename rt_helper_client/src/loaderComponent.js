import React, { Component } from 'react';
import { Table, Tag, Tooltip, Progress, Select, Button, Row, Col, Checkbox, DatePicker, Spin } from 'antd';

export default function loaderComponent(loadingStatus) {
    let progress;

    if (loadingStatus.total) {
        progress = <div>
            <Progress percent={Math.round((loadingStatus.done || 0) / loadingStatus.total * 100)} />
            <div>
                {loadingStatus.done || 0}/{loadingStatus.total}
            </div>
        </div>
    }

    return <div className="center">
                {progress}
                <div>{loadingStatus.text}</div>
            </div>
}