import React from 'react'
import { Link } from 'react-router-dom'
import { NonIdealState, Card } from '@blueprintjs/core'

export default class NotFound extends React.PureComponent {
    render() {
        return (
            <Card>
                <NonIdealState icon="error"
                               title="Not Found"
                               description="The page requested could not be found."
                               action={<Link to="/">Go home</Link>}/>
            </Card>
        )
    }
}
