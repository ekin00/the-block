import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InventorySidebarFilter from './InventorySidebarFilter';

const theme = createTheme();
const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('InventorySidebarFilter', () => {
  it('renders labels with counts from options', () => {
    const options = {
      make: [
        { value: 'Toyota', label: 'Toyota', count: 42 },
        { value: 'Honda', label: 'Honda', count: 18 },
      ],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: [] }}
        options={options}
        onFilterChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Toyota (42)')).toBeTruthy();
    expect(screen.getByText('Honda (18)')).toBeTruthy();
  });

  it('no hard-coded makes like "Telluride" appear when options lack them', () => {
    const options = {
      make: [{ value: 'Toyota', label: 'Toyota', count: 5 }],
      model: [{ value: 'Camry', label: 'Camry', count: 5 }],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: [], model: [] }}
        options={options}
        onFilterChange={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Telluride/i)).toBeNull();
    expect(screen.queryByText(/Golf GTI/i)).toBeNull();
    expect(screen.queryByText(/Kia/i)).toBeNull();
  });

  it('toggling a checkbox calls onFilterChange("make", ["Mazda"])', () => {
    const onFilterChange = vi.fn();
    const options = {
      make: [{ value: 'Mazda', label: 'Mazda', count: 7 }],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: [] }}
        options={options}
        onFilterChange={onFilterChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /Mazda \(7\)/i });
    fireEvent.click(checkbox);

    expect(onFilterChange).toHaveBeenCalledWith('make', ['Mazda']);
  });

  it('unchecking a selected checkbox removes it from filter array', () => {
    const onFilterChange = vi.fn();
    const options = {
      make: [{ value: 'Mazda', label: 'Mazda', count: 7 }],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: ['Mazda'] }}
        options={options}
        onFilterChange={onFilterChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /Mazda \(7\)/i });
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(onFilterChange).toHaveBeenCalledWith('make', []);
  });

  it('Clear all calls onResetAll', () => {
    const onResetAll = vi.fn();
    renderWithTheme(
      <InventorySidebarFilter
        filters={{}}
        onFilterChange={vi.fn()}
        onResetAll={onResetAll}
      />,
    );

    const clearAllButton = screen.getByRole('button', { name: 'Clear all' });
    fireEvent.click(clearAllButton);

    expect(onResetAll).toHaveBeenCalledTimes(1);
  });

  it('Clear all discards an unapplied odometer draft', () => {
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ odometer: [0, 250000] }}
        onFilterChange={vi.fn()}
        onResetAll={vi.fn()}
      />,
    );
    const max = screen.getByLabelText('Max');
    fireEvent.change(max, { target: { value: '50000' } });
    expect(max.value).toBe('50000');
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(max.value).toBe('250000');
    expect(screen.getByRole('slider', { name: 'Maximum odometer' })).toBeTruthy();
  });

  it('Reset Make calls onResetSection("make")', () => {
    const onResetSection = vi.fn();
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: ['Toyota'] }}
        onFilterChange={vi.fn()}
        onResetSection={onResetSection}
      />,
    );

    const resetButton = screen.getByRole('button', { name: 'Reset Make' });
    fireEvent.click(resetButton);

    expect(onResetSection).toHaveBeenCalledWith('make');
  });

  it('Reset section falls back to onFilterChange when onResetSection is omitted', () => {
    const onFilterChange = vi.fn();
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ make: ['Toyota'] }}
        onFilterChange={onFilterChange}
      />,
    );

    const resetButton = screen.getByRole('button', { name: 'Reset Make' });
    fireEvent.click(resetButton);

    expect(onFilterChange).toHaveBeenCalledWith('make', []);
  });

  it('empty section shows "No options available"', () => {
    const options = {
      titleType: [{ value: 'clean', label: 'Clean', count: 10 }],
      year: [{ value: 2025, label: '2025', count: 5 }],
      condition: [{ value: '4', label: 'Grade 4', count: 3 }],
      vehicleType: [{ value: 'SUV', label: 'SUV', count: 8 }],
      make: [],
      model: [{ value: 'Camry', label: 'Camry', count: 2 }],
      engine: [{ value: 'V6', label: 'V6', count: 4 }],
      transmission: [{ value: 'Automatic', label: 'Automatic', count: 9 }],
      fuelType: [{ value: 'Gasoline', label: 'Gasoline', count: 12 }],
      drivetrain: [{ value: 'AWD', label: 'AWD', count: 6 }],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{}}
        options={options}
        onFilterChange={vi.fn()}
      />,
    );

    expect(screen.getByText('No options available')).toBeTruthy();
  });

  it('odometer Apply with min>max yields an ordered pair', () => {
    const onFilterChange = vi.fn();
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ odometer: [0, 250000] }}
        onFilterChange={onFilterChange}
      />,
    );

    const minInput = screen.getByRole('spinbutton', { name: 'Min' });
    const maxInput = screen.getByRole('spinbutton', { name: 'Max' });
    const applyButton = screen.getByRole('button', { name: 'Apply' });

    fireEvent.change(minInput, { target: { value: '80000' } });
    fireEvent.change(maxInput, { target: { value: '20000' } });
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith('odometer', [20000, 80000]);
  });

  it('odometer Apply with non-numeric input does not produce NaN', () => {
    const onFilterChange = vi.fn();
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ odometer: [0, 250000] }}
        onFilterChange={onFilterChange}
      />,
    );

    const minInput = screen.getByRole('spinbutton', { name: 'Min' });
    const applyButton = screen.getByRole('button', { name: 'Apply' });

    fireEvent.change(minInput, { target: { value: '' } });
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith('odometer', [0, 250000]);
  });

  it('filters section options by search query case-insensitively', () => {
    const options = {
      model: [
        { value: 'Toyota', label: 'Toyota', count: 10 },
        { value: 'Tesla', label: 'Tesla', count: 5 },
        { value: 'Ford', label: 'Ford', count: 8 },
      ],
    };
    renderWithTheme(
      <InventorySidebarFilter
        filters={{ model: [] }}
        options={options}
        onFilterChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand Model' }));
    const searchInput = screen.getByRole('textbox', { name: 'Search models' });
    fireEvent.change(searchInput, { target: { value: 'to' } });

    expect(screen.getByText('Toyota (10)')).toBeTruthy();
    expect(screen.queryByText('Tesla (5)')).toBeNull();
    expect(screen.queryByText('Ford (8)')).toBeNull();
  });

  it('renders header with Filters heading and manages collapse/expand accessibility', () => {
    renderWithTheme(
      <InventorySidebarFilter
        filters={{}}
        onFilterChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Filters' })).toBeTruthy();

    const makeCollapseButton = screen.getByRole('button', { name: 'Collapse Make' });
    expect(makeCollapseButton.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(makeCollapseButton);
    expect(screen.getByRole('button', { name: 'Expand Make' })).toBeTruthy();
  });
});
