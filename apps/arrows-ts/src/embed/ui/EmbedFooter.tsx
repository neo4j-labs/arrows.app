import Footer from '../../components/Footer';
import { postToHost } from '../bridge/hostPost';

const wrap: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
};

function interceptExternalLink(e: React.MouseEvent<HTMLDivElement>): void {
  const anchor = (e.target as HTMLElement | null)?.closest('a');
  const href = anchor?.getAttribute('href');
  if (!href || !/^https?:\/\//i.test(href)) return;
  e.preventDefault();
  postToHost({ type: 'open-external', url: href });
}

export function EmbedFooter(): JSX.Element {
  return (
    <div style={wrap} onClick={interceptExternalLink}>
      <Footer onHelpClick={() => postToHost({ type: 'command', name: 'arrows.openTutorial' })} />
    </div>
  );
}
