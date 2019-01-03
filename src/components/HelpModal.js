import React, {Component} from 'react';
import {connect} from "react-redux"
import {Modal, Segment, Image, Button, Message} from 'semantic-ui-react'
import help_add_node from  '../help/help_add_node.gif'
import help_drag_to_create from  '../help/help_drag_to_create.gif'
import help_drag_to_connect from  '../help/help_drag_to_connect.gif'
import help_select from  '../help/help_select.gif'
import help_caption from  '../help/help_caption.gif'
import help_add_property from  '../help/help_add_property.gif'
import help_duplicate from  '../help/help_duplicate.gif'
import help_scale from  '../help/help_scale.gif'

class HelpModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    return (
      <Modal
        size="fullscreen"
        open={this.props.showModal}
        onClose={this.onCancel}
      >
        <Modal.Header>Help</Modal.Header>
        <Modal.Content scrolling>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Create a node</h3>
            <Image src={help_add_node}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Drag to Create Nodes and Relationships</h3>
            <Image src={help_drag_to_create}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Drag to Connect Nodes</h3>
            <Image src={help_drag_to_connect}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Selection</h3>
            <Message>Tip: hold down the command key (Mac) to select multiple nodes.</Message>
            <Image src={help_select}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Choose a Caption</h3>
            <Image src={help_caption}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Add Properties</h3>
            <Image src={help_add_property}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Duplicate Nodes and Relationships</h3>
            <Image src={help_duplicate}/>
          </Segment>
          <Segment compact style={{ display: 'inline-block' }}>
            <h3>Spread-out or flip the layout</h3>
            <Image src={help_scale}/>
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Done"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    showModal: true
  }
}

const mapDispatchToProps = () => {
  return {
    onCancel: () => {
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpModal)