import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NameText } from '../NameText';

describe('NameText', () => {
  it('renders the provided name', () => {
    render(<NameText name="Alice" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the default "-" fallback when the name is empty, null or undefined', () => {
    const { rerender } = render(<NameText name="" />);
    expect(screen.getByText('-')).toBeInTheDocument();

    rerender(<NameText name={null} />);
    expect(screen.getByText('-')).toBeInTheDocument();

    rerender(<NameText />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders a custom fallback', () => {
    render(<NameText name={null} fallback="unknown" />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('renders children alongside the name', () => {
    render(
      <NameText name="Alice">
        <span>badge</span>
      </NameText>
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('badge')).toBeInTheDocument();
  });

  it('marks names containing invisible characters with different styling than clean names', () => {
    const clean = render(<NameText name="Alice" />).container.querySelector(
      '.MuiTypography-root'
    ) as HTMLElement;
    // "Al<zero-width space>ice" — visually "Alice" but contains U+200B.
    const marked = render(<NameText name={'Al​ice'} />).container.querySelector(
      '.MuiTypography-root'
    ) as HTMLElement;

    expect(clean).toBeTruthy();
    expect(marked).toBeTruthy();
    // The conditional strike-through sx is applied only for the invisible-char
    // name, so emotion produces a different class on that element.
    expect(marked.className).not.toBe(clean.className);
  });
});
