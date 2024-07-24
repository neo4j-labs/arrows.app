import React, { Component } from 'react';
import {
  Segment,
  Form,
  Button,
  ButtonGroup,
  Divider,
  Input,
} from 'semantic-ui-react';
import { GeneralToolbox } from './GeneralToolbox';
import GeneralStyling from './GeneralStyling';
import ThemeCards from './ThemeCards';
import { renderCounters } from './EntityCounters';

export default class GeneralInspector extends Component {
  render() {
    const {
      graph,
      onSaveGraphStyle,
      cachedImages,
      onApplyTheme,
      styleMode,
      onSelect,
      onDescriptionChange,
    } = this.props;

    const styleContent =
      styleMode === 'customize' ? (
        <GeneralStyling
          graph={graph}
          onSaveGraphStyle={onSaveGraphStyle}
          cachedImages={cachedImages}
        />
      ) : (
        <ThemeCards onApplyTheme={onApplyTheme} />
      );

    return (
      <Segment basic style={{ margin: 0 }}>
        <Form style={{ textAlign: 'left' }}>
          <Form.Field key="_selected">
            <label>
              {graph.nodes.length + graph.relationships.length > 0
                ? 'Graph:'
                : 'Empty graph'}
            </label>
            {renderCounters(
              graph.nodes.map((node) => node.id),
              graph.relationships.map((relationship) => relationship.id),
              onSelect,
              null
            )}
          </Form.Field>
          <GeneralToolbox onPlusNodeClick={this.props.onPlusNodeClick} />
          <Form.Field key="_description">
            <label>Description</label>
            <Input
              value={graph.description}
              onChange={(e, { value }) => onDescriptionChange(value)}
            />
          </Form.Field>
          <Divider
            key="StyleDivider"
            horizontal
            clearing
            style={{ paddingTop: 50 }}
          >
            Style
          </Divider>
          <div
            style={{
              clear: 'both',
              textAlign: 'center',
              paddingBottom: 20,
            }}
          >
            <ButtonGroup>
              <Button
                onClick={this.props.onStyleTheme}
                active={styleMode === 'theme'}
                secondary={styleMode === 'theme'}
              >
                Theme
              </Button>
              <Button
                onClick={this.props.onStyleCustomize}
                active={styleMode === 'customize'}
                secondary={styleMode === 'customize'}
              >
                Customize
              </Button>
            </ButtonGroup>
          </div>
          {styleContent}
        </Form>
      </Segment>
    );
  }
}
