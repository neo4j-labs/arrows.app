import React, { Component } from 'react'
import { Form, Segment, Icon, Header, Divider } from 'semantic-ui-react'
import EagerInput from './EagerInput'
import { connect } from "react-redux";
import { setRelationshipType } from "../actions/graph";

class RelationshipEditor extends Component {
  constructor (props) {
    super(props)
  }

  render() {
    const { item, onSaveType } = this.props
    if (!item) {
      return null
    }
    const relationshipId = item.id

    return (
      <Segment inverted>
        <Header as='h2' icon>
          <Icon name='settings'/>
          Relationship Settings
        </Header>
        <Form inverted style={{ 'textAlign': 'left' }}>
          <Form.Field key={relationshipId + '_type'}>
            <label>Relationship Type</label>
            <EagerInput value={item.type} onSave={(value) => onSaveType(relationshipId, value)}
                        placeholder='Relationship Type'/>
          </Form.Field>
        </Form>
      </Segment>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSaveType: (relationshipId, type) => {
      dispatch(setRelationshipType(relationshipId, type))
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(RelationshipEditor)
