import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '@/components/SearchBar';

// Mock the API
jest.mock('@/lib/api', () => ({
  productsApi: {
    getSuggestions: jest.fn(() => Promise.resolve(['Product 1', 'Product 2'])),
  },
}));

// Mock the store
jest.mock('@/store/useStore', () => ({
  useStore: () => ({
    setSearchQuery: jest.fn(),
  }),
}));

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search products/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when Enter is pressed', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should show clear button when input has value', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: '' });
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search products/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });
});
