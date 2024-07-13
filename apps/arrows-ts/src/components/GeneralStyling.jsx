import React, { Component } from 'react';
import StyleTable from './StyleTable';
import { styleAttributeGroups } from '@neo4j-arrows/model';

export default class GeneralStyling extends Component {
  render() {
    const { graph, onSaveGraphStyle } = this.props;
    const fields = [];

    for (const group of styleAttributeGroups) {
      fields.push(
        <StyleTable
          key={group.name + 'Style'}
          title={group.name}
          style={{}}
          graphStyle={graph.style}
          possibleStyleAttributes={group.attributes.map(
            (attribute) => attribute.key
          )}
          cachedImages={this.props.cachedImages}
          onSaveStyle={(styleKey, styleValue) =>
            onSaveGraphStyle(styleKey, styleValue)
          }
        />
      );
    }

    const disabledSubmitButtonToPreventImplicitSubmission = (
      <button
        type="submit"
        disabled
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    );

    return (
      <React.Fragment>
        {disabledSubmitButtonToPreventImplicitSubmission}
        {fields}
      </React.Fragment>
    );
  }
}
