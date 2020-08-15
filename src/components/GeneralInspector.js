import React, {Component} from 'react'
import {Segment, Form, Divider} from 'semantic-ui-react'
import StyleTable from "./StyleTable"
import {styleAttributeGroups} from "../model/styling";
import {GeneralToolbox} from "./GeneralToolbox";

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle} = this.props
    const fields = []

    for (const group of styleAttributeGroups) {
      fields.push(
        <StyleTable key={group.name + 'Style'}
                    title={group.name}
                    style={{}}
                    graphStyle={graph.style}
                    possibleStyleAttributes={group.attributes.map(attribute => attribute.key)}
                    onSaveStyle={(styleKey, styleValue) => onSaveGraphStyle(styleKey, styleValue)}
        />
      )
    }

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            <Form.Field key='_selected'>
              <label>No selection</label>
            </Form.Field>
            <GeneralToolbox onPlusNodeClick={this.props.onPlusNodeClick}/>
            <Divider horizontal clearing style={{paddingTop: 50}}>Style</Divider>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }

}