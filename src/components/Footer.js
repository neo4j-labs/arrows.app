import React from "react";

const Footer = (props) => {
  return (
    <footer
      style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#31333C',
        padding: '2px 5px'
      }}
    >
    <p style={{
      color: '#BCC0C9',
      fontSize: '11px'
    }}>
      Arrows.app powered by Neo4j Labs
    </p>
    </footer>
  )
}

export default Footer