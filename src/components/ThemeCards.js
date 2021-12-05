import React, {Component} from 'react';
import {themes} from "../model/themes";
import {renderSvgDom} from "../graphics/utils/offScreenSvgRenderer";
import {constructGraphFromFile} from "../storage/googleDriveStorage";

export default class ThemeCards extends Component {

  render() {
    const cards = themes.map(theme => {
      const graph = constructGraphFromFile(theme.graph).graph
      const {dataUrl} = renderSvgDom(graph)

      console.log('Doing stuff')

      return (
        <div key={theme.name} style={{
          paddingBottom: '10px'
        }}>
          <div style={{
            height: 230,
            padding: 10,
            border: '1px solid #1B1C1D',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundColor: theme.graph.style['background-color']
          }} onClick={() => this.props.onApplyTheme(theme.graph.style)}>
            <img src={dataUrl} alt={theme.description} style={{
              width: '100%',
              position: 'relative',
              top: '50%',
              transform: 'translateY(-50%)'
            }}/>
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 'bold'
          }}>{theme.name}</div>
        </div>
      );
    })

    return (
      <React.Fragment>
        {cards}
      </React.Fragment>
    )
  }
}
