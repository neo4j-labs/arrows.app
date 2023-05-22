import React from 'react';
import { connect } from "react-redux"

const FeatureToggle = ({ children, features, name, renderIf }) => {
  const toggleEnabled = features[name]

  if (renderIf === toggleEnabled) {
    return children;
  } else {
    return [];
  }
}

const mapStateToProps = state => ({
  features: state.features
})

export default connect(mapStateToProps)(FeatureToggle)
