import React from 'react';
import { Card } from '@blueprintjs/core';

export default class Footer extends React.PureComponent {
    render() {
        return (
            <Card className="card-footer">
                Got a feature request or an issue? Post it on the <a href="https://github.com/flotwig/chromium-downloads">GitHub repo</a>!<br/>
                The Chromium™ open source project is a registered trademark of Google LLC. All rights reserved.
            </Card>
        )
    }
}
