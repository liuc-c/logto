import { render } from '@testing-library/react';

import BrandLoading from '.';

it('keeps each loading badge mask and clip references within its own SVG', () => {
  const { container } = render(
    <>
      <BrandLoading />
      <BrandLoading />
    </>
  );
  const ids = Array.from(container.querySelectorAll('[id]'), ({ id }) => id);
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(ids.length);

  const badges = Array.from(container.querySelectorAll('svg'));
  expect(badges).toHaveLength(2);
  for (const badge of badges) {
    const references = Array.from(badge.querySelectorAll('[mask], [clip-path]'));
    expect(references).toHaveLength(2);
    for (const reference of references) {
      const target = reference.getAttribute('mask') ?? reference.getAttribute('clip-path');
      expect(target).toBeTruthy();
      expect(badge.querySelector(`[id="${target?.slice(5, -1)}"]`)).not.toBeNull();
    }
  }
});
