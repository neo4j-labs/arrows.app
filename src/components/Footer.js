import React from "react";
import neo4j_logo_white from "../images/neo4j_logo_white.png";
import {footerHeight} from "../model/applicationLayout";
import {informationLinks} from "./informationLinks";

const Footer = (props) => {
  const links = informationLinks.map(link => {
    const [linkText, href] = link
    return (
      <p key={href} style={{
        color: '#BCC0C9',
        fontSize: '11px',
        lineHeight: '26px',
        marginLeft: '20px',
      }}>
        <a href={href} target='_blank'>
          {linkText}
        </a>
      </p>
    )
  })

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
        Arrows.app powered by <a href="https://neo4j.com/labs/arrows" target='_blank'>Neo4j Labs</a>
      </p>
      <p style={{
        color: '#BCC0C9',
        fontSize: '11px',
        lineHeight: '26px',
        marginLeft: '20px',
      }}>
        <a onClick={props.onHelpClick}>
          Help
        </a>
      </p>
      {links}
      <p style={{
        flex: 2,
      }}/>
      <p style={{
        lineHeight: '26px'
      }}>
        <a href='https://neo4j.com?ref=arrows.app' target='_blank'>
          <img src={neo4j_logo_white} style={{ height: '24px' }} alt='Neo4j logo'/>
        </a>
      </p>
    </footer>
  )
}

export default Footer