/// <reference types="jest" />
import * as React from 'react';
import { render } from '@testing-library/react';
import { NeoReactInput } from './input';

describe('Input', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NeoReactInput
        onInput={() => {}}
        autocomplete={false}
        disabled={false}
        commitOnInput={false}
        invalid={false}
        size="base"
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
