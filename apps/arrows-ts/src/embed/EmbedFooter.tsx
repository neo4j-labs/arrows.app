export function EmbedFooter(): JSX.Element {
  return (
    <footer
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 22,
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontFamily: 'sans-serif',
        fontSize: 11,
        color: '#888',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(4px)',
        borderTop: '1px solid #e0e0e0',
        pointerEvents: 'none',
      }}
    >
      <a
        href="https://neo4j.com/labs/arrows?ref=vscode"
        target="_blank"
        rel="noreferrer"
        style={{ color: '#888', textDecoration: 'none', pointerEvents: 'auto' }}
      >
        Powered by{' '}
        <span style={{ color: '#018BFF', fontWeight: 600 }}>Neo4j Labs</span>
      </a>
    </footer>
  );
}
