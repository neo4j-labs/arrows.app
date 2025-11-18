import React, { Component } from 'react';
import { Modal, Form, Button, Icon, Message, Comment, Segment } from 'semantic-ui-react';

class ChatInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [],
      loading: false,
      error: null,
      threadId: this.generateThreadId(props.agentId),
      memoryEnabled: true
    };
    this.messagesEndRef = React.createRef();
  }

  // Generate thread_id: {agent_id}_{uuid}_{timestamp}
  generateThreadId = (agentId) => {
    const uuid = crypto.randomUUID().substring(0, 8);
    const timestamp = Math.floor(Date.now() / 1000);
    return `${agentId}_${uuid}_${timestamp}`;
  };

  // Scroll to bottom of messages
  scrollToBottom = () => {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    // Auto-scroll when new messages arrive
    if (prevState.messages.length !== this.state.messages.length) {
      this.scrollToBottom();
    }
  }

  handleSendMessage = async () => {
    const { message, threadId, memoryEnabled, messages } = this.state;
    const { agentId, apiUrl } = this.props;

    if (!message.trim()) return;

    // Add user message to history
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    this.setState({
      messages: [...messages, userMessage],
      message: '',
      loading: true,
      error: null
    });

    try {
      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          thread_id: threadId,
          message: message,
          memory_enabled: memoryEnabled
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Add assistant message to history
      const assistantMessage = {
        role: 'assistant',
        content: result.message.content,
        timestamp: result.message.timestamp,
        execution_time_ms: result.execution_time_ms
      };

      this.setState({
        messages: [...this.state.messages, assistantMessage],
        loading: false
      });

    } catch (error) {
      console.error('Chat error:', error);
      this.setState({
        loading: false,
        error: error.message
      });
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSendMessage();
    }
  };

  handleNewChat = () => {
    this.setState({
      messages: [],
      threadId: this.generateThreadId(this.props.agentId),
      error: null
    });
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  render() {
    const { open, onClose, agentId, agentName } = this.props;
    const { message, messages, loading, error, memoryEnabled } = this.state;

    return (
      <Modal
        open={open}
        onClose={onClose}
        size="large"
        closeIcon
      >
        <Modal.Header>
          <Icon name='comments' />
          Chat with {agentName || agentId}
        </Modal.Header>

        <Modal.Content scrolling style={{ minHeight: '500px', maxHeight: '600px' }}>
          {/* Memory Toggle */}
          <Message info size='small'>
            <Form.Checkbox
              label='Enable conversation memory'
              checked={memoryEnabled}
              onChange={(e, { checked }) => this.setState({ memoryEnabled: checked })}
            />
            {memoryEnabled && (
              <p style={{ marginTop: '8px', fontSize: '0.9em' }}>
                The agent will remember previous messages in this conversation.
              </p>
            )}
          </Message>

          {/* Error Message */}
          {error && (
            <Message negative icon>
              <Icon name='exclamation circle' />
              <Message.Content>
                <Message.Header>Error</Message.Header>
                <p>{error}</p>
              </Message.Content>
            </Message>
          )}

          {/* Message History */}
          {messages.length === 0 ? (
            <Segment placeholder>
              <Icon name='chat' size='huge' style={{ color: '#ccc' }} />
              <p style={{ color: '#999', marginTop: '16px' }}>
                No messages yet. Start a conversation!
              </p>
            </Segment>
          ) : (
            <Comment.Group style={{ maxWidth: 'none' }}>
              {messages.map((msg, index) => (
                <Comment key={index}>
                  <Comment.Avatar
                    src={msg.role === 'user'
                      ? 'https://react.semantic-ui.com/images/avatar/small/matt.jpg'
                      : 'https://react.semantic-ui.com/images/avatar/small/bot.png'
                    }
                  />
                  <Comment.Content>
                    <Comment.Author as='span'>
                      {msg.role === 'user' ? 'You' : 'Agent'}
                    </Comment.Author>
                    <Comment.Metadata>
                      <div>{this.formatTimestamp(msg.timestamp)}</div>
                      {msg.execution_time_ms && (
                        <div>
                          <Icon name='clock' />
                          {Math.round(msg.execution_time_ms)}ms
                        </div>
                      )}
                    </Comment.Metadata>
                    <Comment.Text style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Comment.Text>
                  </Comment.Content>
                </Comment>
              ))}
              <div ref={this.messagesEndRef} />
            </Comment.Group>
          )}

          {/* Loading Indicator */}
          {loading && (
            <Message icon info>
              <Icon name='circle notched' loading />
              <Message.Content>
                <Message.Header>Agent is thinking...</Message.Header>
              </Message.Content>
            </Message>
          )}
        </Modal.Content>

        <Modal.Actions style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Message Input */}
          <Form style={{ width: '100%', margin: 0 }}>
            <Form.Group style={{ margin: 0 }}>
              <Form.TextArea
                placeholder='Type your message here... (Press Enter to send, Shift+Enter for new line)'
                value={message}
                onChange={(e) => this.setState({ message: e.target.value })}
                onKeyPress={this.handleKeyPress}
                disabled={loading}
                style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                rows={2}
              />
              <Button
                primary
                icon
                labelPosition='left'
                onClick={this.handleSendMessage}
                disabled={loading || !message.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                <Icon name='send' />
                Send
              </Button>
            </Form.Group>
          </Form>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              onClick={this.handleNewChat}
              icon
              labelPosition='left'
            >
              <Icon name='refresh' />
              New Chat
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ChatInterface;
