import { render } from '@testing-library/react';

import BosshireTestComponents from './components';

describe('BosshireTestComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BosshireTestComponents />);
    expect(baseElement).toBeTruthy();
  });
});
