import React, {Component} from 'react';
import {Modal, Button, Tab} from 'semantic-ui-react'
import ExportPngPanel from "./ExportPngPanel";
import ExportCypherPanel from "./ExportCypherPanel";
import ExportSvgPanel from "./ExportSvgPanel";

class ExportModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const panes = [
      {
        menuItem: 'PNG',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportPngPanel
              graph={this.props.graph}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        )
      },
      {
        menuItem: 'SVG',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportSvgPanel
              graph={this.props.graph}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Cypher',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportCypherPanel
              graph={this.props.graph}
            />
          </Tab.Pane>
        )
      }
    ]

    return (
      <Modal
        size="large"
        centered={false}
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Export</Modal.Header>
        <Modal.Content scrolling>
          <Tab menu={{secondary: true}} panes={panes}/>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Done"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default ExportModal