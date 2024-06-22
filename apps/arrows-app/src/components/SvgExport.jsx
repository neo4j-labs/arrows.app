import React, { Component } from 'react';
import { Image, Segment, Label, Icon } from 'semantic-ui-react';
import { renderSvgEncapsulated } from '../graphics/utils/offScreenSvgRenderer';

class SvgExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      dataUrl: null,
    };
  }

  componentDidMount() {
    renderSvgEncapsulated(this.props.graph, this.props.cachedImages).then(
      (renderResult) => {
        this.setState(renderResult);
      }
    );
  }

  render() {
    if (this.state.dataUrl) {
      const { width, height, dataUrl } = this.state;

      return (
        <Segment
          style={{
            maxHeight: 200,
            overflow: 'hidden',
          }}
        >
          <Label attached="top">
            {width} × {height}
            <a href={dataUrl} download={this.props.diagramName + '.svg'}>
              <Icon name="download" />
              Download
            </a>
          </Label>
          <div
            style={{
              display: 'inline-block',
              backgroundImage:
                'linear-gradient(45deg, #efefef 25%, transparent 25%), ' +
                'linear-gradient(-45deg, #efefef 25%, transparent 25%), ' +
                'linear-gradient(45deg, transparent 75%, #efefef 75%), ' +
                'linear-gradient(-45deg, transparent 75%, #efefef 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            <Image src={dataUrl} />
          </div>
        </Segment>
      );
    } else {
      return (
        <Segment
          style={{
            maxHeight: 200,
            overflow: 'hidden',
          }}
        >
          <Label attached="top">Rendering...</Label>
        </Segment>
      );
    }
  }
}

export default SvgExport;
