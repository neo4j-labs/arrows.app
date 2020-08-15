import React, {Component} from 'react';

class ExportJsonPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <code>
        <pre>
          {JSON.stringify(this.props.graph, null, 2)}
        </pre>
      </code>
    )
  }
}

export default ExportJsonPanel