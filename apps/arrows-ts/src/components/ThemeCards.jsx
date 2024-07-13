import React, { Component } from 'react';
import { themes } from '@neo4j-arrows/model';
import { renderSvgDom } from '../graphics/utils/offScreenSvgRenderer';
import { constructGraphFromFile } from '../storage/googleDriveStorage';
import convert from 'react-from-dom';

export default class ThemeCards extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return false;
  }

  render() {
    const cards = themes.map((theme) => {
      const graph = constructGraphFromFile(theme.graph).graph;
      const svgDom = renderSvgDom(graph);
      svgDom.style.width = '100%';
      svgDom.style.position = 'relative';
      svgDom.style.top = '50%';
      svgDom.style.transform = 'translateY(-50%)';

      return (
        <div
          key={theme.name}
          style={{
            paddingBottom: '10px',
          }}
        >
          <div
            style={{
              height: 230,
              padding: 10,
              border: '1px solid #1B1C1D',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: theme.graph.style['background-color'],
            }}
            onClick={() => this.props.onApplyTheme(theme.graph.style)}
          >
            {convert(svgDom)}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {theme.name}
          </div>
        </div>
      );
    });

    return <React.Fragment>{cards}</React.Fragment>;
  }
}
