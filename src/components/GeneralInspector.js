import React, {Component} from 'react'
import {Segment, Form, Button, ButtonGroup} from 'semantic-ui-react'
import {GeneralToolbox} from "./GeneralToolbox";
import GeneralStyling from "./GeneralStyling";
import ThemeCards from "./ThemeCards";

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle, cachedImages, onApplyTheme, styleMode} = this.props

    const styleContent = styleMode === 'customize' ?
      <GeneralStyling graph={graph} onSaveGraphStyle={onSaveGraphStyle} cachedImages={cachedImages}/> :
      <ThemeCards onApplyTheme={onApplyTheme}/>

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            <Form.Field key='_selected'>
              <label>No selection</label>
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