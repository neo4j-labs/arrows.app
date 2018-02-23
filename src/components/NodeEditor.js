import React from 'react'
import { Form, Segment, Icon, Header } from 'semantic-ui-react'
import EagerInput from './EagerInput'
import { modifyGraph } from "../actions/neo4jStorage";
import { connect } from "react-redux";
import { updateNodeProperties } from "../actions/graph";

const NodeEditor = ({item, onSave}) => {
  if (!item) {
    return null
  }

  const nodeId = item.id
  return (
    <Segment inverted>
      <Header as='h2' icon>
        <Icon name='settings'/>
        Node Settings
      </Header>
      <Form inverted style={{ 'textAlign': 'left' }}>
        <Form.Field key={nodeId.value + '_caption'}>
          <label>Caption</label>
          <EagerInput value={item.caption} onSave={(value) => onSave(nodeId, '_caption', value)} placeholder='Node Caption'/>
        </Form.Field>
        {
          Object.keys(item.properties).map(propertyKey =>
            <Form.Field key={nodeId.value + propertyKey}>
              <label>{propertyKey}</label>
              <EagerInput
                placeholder={propertyKey}
                value={item.properties[propertyKey]}
                onSave={(val) => onSave(nodeId, propertyKey, val)}/>
            </Form.Field>
          )
        }
      </Form>
    </Segment>
  )
}

const mapDispatchToProps = dispatch => {
  return {
    onSave: (nodeId, key, value) => dispatch(modifyGraph(updateNodeProperties(nodeId, [{key, value}])))
  }
}

export default connect(
  null,
  mapDispatchToProps
)(NodeEditor)
