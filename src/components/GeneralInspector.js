import React, {Component} from 'react'
import {Segment, Form, Button, ButtonGroup} from 'semantic-ui-react'
import {GeneralToolbox} from "./GeneralToolbox";
import GeneralStyling from "./GeneralStyling";
import ThemeCards from "./ThemeCards";
import {renderCounters} from "./EntityCounters";

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle, cachedImages, onApplyTheme, styleMode, onSelect} = this.props

    const styleContent = styleMode === 'customize' ?
      <GeneralStyling graph={graph} onSaveGraphStyle={onSaveGraphStyle} cachedImages={cachedImages}/> :
      <ThemeCards onApplyTheme={onApplyTheme}/>

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            <Form.Field key='_selected'>
              <label>{graph.nodes.length + graph.relationships.length > 0 ? 'Graph:' : 'Empty graph'}</label>
              {renderCounters(
                graph.nodes.map(node => node.id),
                graph.relationships.map(relationship => relationship.id),
                onSelect,
                null
              )}
            </Form.Field>
            <GeneralToolbox onPlusNodeClick={this.props.onPlusNodeClick}/>
            <div style={{
              clear: 'both',
              textAlign: 'center',
              paddingTop: 50,
              paddingBottom: 20
            }}>
              <ButtonGroup>
                <Button
                  onClick={this.props.onStyleTheme}
                  active={styleMode === 'theme'}
                  primary={styleMode === 'theme'}
                >Theme</Button>
                <Button
                  onClick={this.props.onStyleCustomize}
                  active={styleMode === 'customize'}
                  primary={styleMode === 'customize'}
                >Customize</Button>
              </ButtonGroup>
            </div>
            {styleContent}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }

}