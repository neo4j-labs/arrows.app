import React, { Component } from 'react';
import { Modal, Button, Tab } from 'semantic-ui-react';
import ExportPngPanel from './ExportPngPanel';
import ExportSvgPanel from './ExportSvgPanel';
import ExportJsonPanel from './ExportJsonPanel';
import ExportLinkMLPanel from './ExportLinkMLPanel';
import {
  loadFavoriteExportTab,
  saveFavoriteExportTab,
} from '../actions/localStorage';
import ExportUrlPanel from './ExportUrlPanel';

class ExportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: loadFavoriteExportTab() || 0,
    };
  }

  onCancel = () => {
    this.props.onCancel();
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activeIndex });
    saveFavoriteExportTab(activeIndex);
  };

  render() {
    const panes = [
      {
        menuItem: 'PNG',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportPngPanel
              graph={this.props.graph}
              cachedImages={this.props.cachedImages}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'SVG',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportSvgPanel
              graph={this.props.graph}
              cachedImages={this.props.cachedImages}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'JSON',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportJsonPanel
              graph={this.props.graph}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'URL',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportUrlPanel
              graph={this.props.graph}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'LinkML',
        render: () => (
          <Tab.Pane attached={false}>
            <ExportLinkMLPanel
              graph={this.props.graph}
              diagramName={this.props.diagramName}
            />
          </Tab.Pane>
        ),
      },
    ];

    return (
      <Modal size="large" centered={false} open={true} onClose={this.onCancel}>
        <Modal.Header>Export</Modal.Header>
        <Modal.Content scrolling>
          <Tab
            menu={{ secondary: true }}
            panes={panes}
            activeIndex={this.state.activeIndex}
            onTabChange={this.handleTabChange}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.onCancel} content="Done" />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ExportModal;
