import React from 'react'
import { Card, Grid } from 'semantic-ui-react'

export default function UserDefault() {
    return (
        <div>
            <Grid columns="equal">
                <Grid.Row>
                    <Grid.Column>
                        <Card fluid>
                        <Card.Content>
                            <Card.Header>Passed Events</Card.Header>
                        </Card.Content>
                        </Card>
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                        <Card.Content>
                            <Card.Header>Recent active users</Card.Header>
                        </Card.Content>
                        </Card>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    )
}
