import React, {Component} from 'react'
import {Segment, Form, Divider, Button} from 'semantic-ui-react'
import StyleTable from "./StyleTable"
import {styleAttributeGroups} from "../model/styling";
import {GeneralToolbox} from "./GeneralToolbox";

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle} = this.props
    const fields = []

    fields.push(
      <Form.Field key='theme'>
        <label>Theme</label>
        <Button
          color='blue'
          size='tiny'
          content='Choose Theme'
          onClick={this.props.onShowStyleDialog}/>
      </Form.Field>
    )

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

    const disabledSubmitButtonToPreventImplicitSubmission = (
      <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"/>
    )

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {disabledSubmitButtonToPreventImplicitSubmission}
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