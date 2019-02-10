import React, {Component} from 'react';
import {Message, Icon, Checkbox} from 'semantic-ui-react'
import PngExport from "./PngExport";

class ExportPngPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transparentBackground: true
    }
  }

  toggleTransparent = () => {
    this.setState({
      transparentBackground: !this.state.transparentBackground
    })
  }

  render() {
    return (
      <React.Fragment>
        <Message info icon>
          <Icon name='info'/>
          <p>
            Below are a few PNGs at different "pixel ratios".
            Choose your preferred resolution and then get hold of the image by:
            <ul>
              <li>Clicking on the "Download" link to download a file to your computer, or</li>
              <li>Right-clicking on the image and choosing "Copy Image", or</li>
              <li>Dragging the image to another browser tab or to another application.</li>
            </ul>
          </p>
        </Message>
        <Checkbox label='Transparent background' checked={this.state.transparentBackground}
                  onChange={this.toggleTransparent}/>

        {
          [1, 2, 4].map((pixelRatio => (
            <PngExport
              graph={this.props.graph}
              diagramName={this.props.diagramName}
              pixelRatio={pixelRatio}
              transparentBackground={this.state.transparentBackground}
            />
          )))
        }
      </React.Fragment>
    )
  }
}

export default ExportPngPanel