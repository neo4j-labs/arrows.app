import React, {Component} from 'react'
import {Segment, Form, Menu, Icon} from 'semantic-ui-react'
import StyleTable from "./StyleTable"
import {nodeStyleAttributes, relationshipStyleAttributes} from "../model/styling";
import {headerHeight} from "../model/applicationLayout"

export default class GeneralInspector extends Component {
  render() {
    const {graph} = this.props
    const {onSaveGraphStyle} = this.props
    const fields = []

      fields.push(
        <StyleTable key='nodeStyle'
                    title='Node Style'
                    style={{}}
                    graphStyle={graph.style}
                    possibleStyleAttributes={nodeStyleAttributes}
                    onSaveStyle={(styleKey, styleValue) => onSaveGraphStyle(styleKey, styleValue)}
        />
      )

      fields.push(
        <StyleTable key='relationshipStyle'
                    title='Relationship Style'
                    style={{}}
                    graphStyle={graph.style}
                    possibleStyleAttributes={relationshipStyleAttributes}
                    onSaveStyle={(styleKey, styleValue) => onSaveGraphStyle(styleKey, styleValue)}
        />
      )

    return (
      <React.Fragment>
        <Menu
          borderless
          attached='top'
          style={{borderRadius: 0, width: '100%'}}>
          <Menu.Item style={{height: headerHeight + 'px'}}>
            <Icon name='edit'/>
            Graph foo
          </Menu.Item>
          <Menu.Item
            position='right'
            onClick={this.props.hideInspector}
          >
            <Icon name='angle double right'/>
          </Menu.Item>
        </Menu>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }

}