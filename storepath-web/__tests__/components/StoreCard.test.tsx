import { render, screen, fireEvent } from '@testing-library/react';
import { StoreCard } from '@/components/StoreCard';
import { StoreWithDistance } from '@/types';

// Mock the store
jest.mock('@/store/useStore', () => ({
  useStore: () => ({
    isFavoriteStore: jest.fn(() => false),
    addFavoriteStore: jest.fn(),
    removeFavoriteStore: jest.fn(),
  }),
}));

const mockStore: StoreWithDistance = {
  id: '1',
  name: 'Test Store',
  location: { lat: 12.9716, lng: 77.5946 },
  address: '123 Test Street',
  hours: [
    { day: 'Monday', open: '09:00', close: '21:00' },
  ],
  inventory: [],
  rating: 4.5,
  reviewCount: 100,
  ownerId: 'owner-1',
  categories: ['Groceries'],
  lastInventoryUpdate: Date.now(),
  createdAt: Date.now(),
  distance: 2.5,
  duration: 10,
  isOpen: true,
  accuracyScore: 95,
};

describe('StoreCard', () => {
  it('should render store information', () => {
    render(<StoreCard store={mockStore} />);
    
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('2.5km')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should show "Open" badge when store is open', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should show "Closed" badge when store is closed', () => {
    const closedStore = { ...mockStore, isOpen: false };
    render(<StoreCard store={closedStore} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<StoreCard store={mockStore} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Test Store'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should call onNavigate when Navigate button is clicked', () => {
    const onNavigate = jest.fn();
    render(<StoreCard store={mockStore} onNavigate={onNavigate} />);
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    expect(onNavigate).toHaveBeenCalled();
  });
});
