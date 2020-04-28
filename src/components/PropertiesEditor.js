import React, {Component} from 'react';
import {PropertyKeyEditor} from "./PropertyKeyEditor";
import {PropertyValueEditor} from "./PropertyValueEditor";

export class PropertiesEditor extends Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.visualNode !== this.props.visualNode
  }

  render() {
    const nodeProperties = this.props.visualNode.properties
    const boxPosition = nodeProperties.boxPosition
    const propertiesBox = nodeProperties.propertiesBox
    const { selection, onSetPropertyKey, onSetPropertyValue } = this.props
    return (
      <div>
        {nodeProperties.propertiesBox.properties.map((property, index) => {
          return [
            <PropertyKeyEditor
              key={'key-' + index}
              text={property.key}
              left={boxPosition.x}
              top={boxPosition.y + index * propertiesBox.lineHeight}
              width={propertiesBox.keysWidth}
              font={propertiesBox.font}
              onSetPropertyKey={key => onSetPropertyKey(selection, property.key, key)}
            />,
            <PropertyValueEditor
              key={'value-' + index}
              text={property.value}
              left={boxPosition.x + propertiesBox.keysWidth + propertiesBox.colonWidth + propertiesBox.spaceWidth}
              top={boxPosition.y + index * propertiesBox.lineHeight}
              width={propertiesBox.valuesWidth}
              font={propertiesBox.font}
              onSetPropertyValue={value => onSetPropertyValue(selection, property.key, value)}
            />
          ]
        })}
        {/*<Button*/}
        {/*  key='addProperty'*/}
        {/*  onClick={addEmptyProperty}*/}
        {/*  basic*/}
        {/*  floated='right'*/}
        {/*  size="tiny"*/}
        {/*  icon="plus"*/}
        {/*  content='Property'*/}
        {/*  type='button'*/}
        {/*/>*/}
      </div>
    )
  }
}