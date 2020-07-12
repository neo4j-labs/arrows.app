import React from "react";
import neo4j_logo_white from "../images/neo4j_logo_white.png";
import {footerHeight} from "../model/applicationLayout";

const Footer = (props) => {
  return (
    <footer
      style={{
        width: '100%',
        height: footerHeight + 'px',
        backgroundColor: '#31333C',
        padding: '2px 10px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <p style={{
        color: '#BCC0C9',
        fontSize: '11px',
        lineHeight: '26px',
      }}>
        Arrows.app powered by Neo4j Labs
      </p>
      <p style={{
        color: '#BCC0C9',
        fontSize: '11px',
        lineHeight: '26px',
        marginLeft: '20px',
      }}>
        Help
      </p>
      <p style={{
        color: '#BCC0C9',
        fontSize: '11px',
        lineHeight: '26px',
        marginLeft: '20px',
      }}>
        About
      </p>
      <p style={{
        flex: 2,
      }}/>
      <p style={{
        lineHeight: '26px'
      }}>
        <a href='https://neo4j.com?ref=arrows.app'>
          <img src={neo4j_logo_white} style={{ height: '24px' }} alt='Neo4j logo'/>
        </a>
      </p>
    </footer>
  )
}

export default Footer