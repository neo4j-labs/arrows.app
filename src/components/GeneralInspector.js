import React, {Component} from 'react'
import {Segment, Form} from 'semantic-ui-react'
import StyleTable from "./StyleTable"
import {styleAttributes, styleGroups} from "../model/styling";
import {GeneralToolbox} from "./GeneralToolbox";

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle} = this.props
    const fields = []

    Object.entries(styleGroups).forEach(([groupKey, styleGroup]) => {
      fields.push(
        <StyleTable key={groupKey + 'Style'}
                    title={groupKey + ' Style'}
                    style={{}}
                    graphStyle={graph.style}
                    possibleStyleAttributes={Object.keys(styleAttributes).filter(key => styleAttributes[key].appliesTo === groupKey)}
                    onSaveStyle={(styleKey, styleValue) => onSaveGraphStyle(styleKey, styleValue)}
        />
      )
    })

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            <Form.Field key='_selected'>
              <label>No selection</label>
            </Form.Field>
            <GeneralToolbox onPlusNodeClick={this.props.onPlusNodeClick}/>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }

}