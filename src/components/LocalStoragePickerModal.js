import React, {Component} from 'react';
import {Button, Modal, Table} from 'semantic-ui-react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

class LocalStoragePickerModal extends Component {

  constructor(props) {
    super(props)
    this.state = {fileId: null}
  }

  onCancel = () => {
    this.props.onCancel()
  }

  onClickRow = (fileId) => {
    this.setState({fileId})
  }

  render() {
    const rows = this.props.recentStorage.map(entry => (
      <Table.Row active={this.state.fileId === entry.fileId} onClick={() => this.onClickRow(entry.fileId)}>
        <Table.Cell>{entry.diagramName}</Table.Cell>
        <Table.Cell>{formatDistanceToNow(entry.timestamp, {addSuffix: true})}</Table.Cell>
      </Table.Row>
    ))

    return (
      <Modal
        size="medium"
        centered={false}
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Open diagram from Web Browser local storage</Modal.Header>
        <Modal.Content scrolling>
          <Table selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Last accessed</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {rows}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Cancel"
          />
          <Button
            primary
            disabled={this.state.fileId === null}
            onClick={() => this.props.onPick(this.state.fileId)}
            content="Open"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default LocalStoragePickerModal