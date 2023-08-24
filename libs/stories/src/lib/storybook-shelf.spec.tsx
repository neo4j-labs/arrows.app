import { render } from '@testing-library/react';

import StorybookShelf from './storybook-shelf';

describe('StorybookShelf', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StorybookShelf />);
    expect(baseElement).toBeTruthy();
  });
});
