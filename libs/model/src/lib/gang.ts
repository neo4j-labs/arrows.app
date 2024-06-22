import { Node } from './Node';

export const getCommonCaption = (nodes: Node[]) =>
  nodes.reduce(
    (result, node) => {
      const { caption, commonProps } = result;
      if (commonProps === null) {
        return {
          commonProps: { ...node.properties },
          caption: node.caption,
        };
      } else {
        Object.keys(commonProps).forEach((commonKey) => {
          if (node.properties[commonKey] !== commonProps[commonKey]) {
            delete commonProps[commonKey];
          }
        });

        if (Object.keys(commonProps).length > 0) {
          return {
            commonProps,
            caption,
          };
        } else {
          return {
            commonProps: {},
            caption: caption + ', ' + node.caption,
          };
        }
      }
    },
    {
      caption: null,
      commonProps: null,
    } as { caption: string | null; commonProps: Record<string, unknown> | null }
  );
