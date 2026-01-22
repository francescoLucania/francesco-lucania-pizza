import { render } from '@testing-library/react';

import NavigateList from './navigate-list';

describe('NavigateList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NavigateList navigate={[{ name: 'Test', uri: '/test' }]} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
