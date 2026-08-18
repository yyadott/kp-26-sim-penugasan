import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

const ContohComponent = () => {
  return <div><h1>Halo, Vitest!</h1></div>;
};

describe('ContohComponent', () => {
  it('seharusnya merender teks Halo, Vitest!', () => {
    render(<ContohComponent />);
    expect(screen.getByText('Halo, Vitest!')).toBeInTheDocument();
  });
});
