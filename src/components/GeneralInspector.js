import React, {Component} from 'react'
import {Segment, Form, Menu, Icon, Input, Label, Table} from 'semantic-ui-react'
import StyleTable from "./StyleTable"
import {styleAttributes, styleGroups} from "../model/styling";
import {headerHeight} from "../model/applicationLayout"

export default class GeneralInspector extends Component {
  render() {
    const {graph, onSaveGraphStyle, betaFeaturesEnabled, onSetBetaFeaturesEnabled, onSetPersistClusters, layers} = this.props
    const clustersLayer = layers.find(layer => layer.name === 'gangs')
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
        <Menu
          borderless
          attached='top'
          style={{borderRadius: 0, width: '100%'}}>
          <Menu.Item style={{height: headerHeight + 'px'}}>
            <Icon name='square outline'/>
            Graph
          </Menu.Item>
        </Menu>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {fields}
          </Form>
        </Segment>
        <Segment basic>
          <Table compact>
            <Table.Body>
              <Table.Row>
                <Table.Cell collapsing>
                  <Label basic style={{width: '100%', border: 'none', padding: '0'}} onClick={() => onSetBetaFeaturesEnabled(!betaFeaturesEnabled)}>
                    <Input style={{marginRight: '1em'}} type='checkbox' checked={betaFeaturesEnabled}/>
                    <span>Enable beta features (Graph simplification)</span>
                  </Label>
                </Table.Cell>
              </Table.Row>
              {betaFeaturesEnabled
                ? <Table.Row>
                  <Table.Cell>
                    <Label basic style={{ width: '100%', border: 'none', padding: '0'}} onClick={() => onSetPersistClusters(!clustersLayer.persist)}>
                      <Input style={{ marginRight: '1em' }} type='checkbox' checked={clustersLayer && clustersLayer.persist}/>
                      <span>Persist graph simplifications</span>
                    </Label>
                  </Table.Cell>
                </Table.Row>
                : null
              }
            </Table.Body>
          </Table>
        </Segment>
      </React.Fragment>
    )
  }

}