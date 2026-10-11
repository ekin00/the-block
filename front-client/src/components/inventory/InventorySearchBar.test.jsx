import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InventorySearchBar from './InventorySearchBar';

const theme = createTheme();
const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('InventorySearchBar', () => {
  it('renders controlled value and accessible input with aria-label', () => {
    renderWithTheme(<InventorySearchBar value="Civic" onChange={vi.fn()} onSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    expect(input).toBeTruthy();
    expect(input.value).toBe('Civic');
  });

  it('calls onChange with typed string', () => {
    const onChange = vi.fn();
    renderWithTheme(<InventorySearchBar value="" onChange={onChange} onSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.change(input, { target: { value: 'Toyota' } });

    expect(onChange).toHaveBeenCalledWith('Toyota');
  });

  it('calls onSearch with string value when clicking Search inventory button', () => {
    const onSearch = vi.fn();
    renderWithTheme(<InventorySearchBar value="Corolla" onChange={vi.fn()} onSearch={onSearch} />);

    const button = screen.getByRole('button', { name: 'Search inventory' });
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('Corolla');
  });

  it('calls onSearch with string value when pressing Enter', () => {
    const onSearch = vi.fn();
    renderWithTheme(<InventorySearchBar value="RAV4" onChange={vi.fn()} onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('RAV4');
  });

  it('calls onChange("") only when clicking Clear search button (no double write to onSearch)', () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    renderWithTheme(<InventorySearchBar value="SearchText" onChange={onChange} onSearch={onSearch} />);

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows suggestions dropdown only when suggestions provided and matched', () => {
    const onSearch = vi.fn();
    renderWithTheme(
      <InventorySearchBar
        value="Toy"
        suggestions={['Toyota', 'Toyota Camry', 'Honda']}
        onChange={vi.fn()}
        onSearch={onSearch}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.focus(input);

    const suggestionItem = screen.getByRole('button', { name: /^Toyota$/i });
    expect(suggestionItem).toBeTruthy();

    fireEvent.click(suggestionItem);
    expect(onSearch).toHaveBeenCalledWith('Toyota');
  });

  it('has no fake suggestions when suggestions prop is empty or omitted', () => {
    renderWithTheme(<InventorySearchBar value="some query" onChange={vi.fn()} onSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: 'Search inventory' });
    fireEvent.focus(input);

    expect(screen.queryByRole('list')).toBeNull();
  });
});
