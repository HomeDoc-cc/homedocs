import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useLocationOptions } from '@/hooks/use-location-options';

import { TaskForm } from '../task-form';

// Mock the useLocationOptions hook
jest.mock('@/hooks/use-location-options');

const mockUseLocationOptions = useLocationOptions as jest.MockedFunction<typeof useLocationOptions>;

describe('TaskForm', () => {
  beforeEach(() => {
    mockUseLocationOptions.mockReturnValue({
      homes: [
        { id: 'home1', name: 'Home 1' },
        { id: 'home2', name: 'Home 2' },
      ],
      rooms: [
        { id: 'room1', name: 'Room 1', homeId: 'home1' },
        { id: 'room2', name: 'Room 2', homeId: 'home2' },
      ],
      items: [
        { id: 'item1', name: 'Item 1', roomId: 'room1' },
        { id: 'item2', name: 'Item 2', roomId: 'room2' },
      ],
      isLoading: false,
      error: null,
      refetch: () => {},
    });
  });

  const defaultProps = {
    users: [],
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should pre-select location fields when default values are provided', async () => {
    render(<TaskForm {...defaultProps} defaultItemId="item1" />);

    await waitFor(() => {
      console.log(
        'Item select value:',
        (screen.getByLabelText(/item/i) as HTMLSelectElement).value
      );
      console.log(
        'Room select value:',
        (screen.getByLabelText(/room/i) as HTMLSelectElement).value
      );
      console.log(
        'Home select value:',
        (screen.getByLabelText(/home/i) as HTMLSelectElement).value
      );

      expect(screen.getByLabelText(/item/i)).toHaveValue('item1');
      expect(screen.getByLabelText(/room/i)).toHaveValue('room1');
      expect(screen.getByLabelText(/home/i)).toHaveValue('home1');
    });
  });

  it('should only pre-select valid combinations of locations', async () => {
    render(<TaskForm {...defaultProps} defaultRoomId="room2" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/home/i)).toHaveValue('home2');
      expect(screen.getByLabelText(/room/i)).toHaveValue('room2');
      expect(screen.getByLabelText(/item/i)).toHaveValue('');
    });
  });

  it('should auto-select the only home when there is just one', async () => {
    mockUseLocationOptions.mockReturnValue({
      homes: [{ id: 'home1', name: 'Home 1' }],
      rooms: [{ id: 'room1', name: 'Room 1', homeId: 'home1' }],
      items: [{ id: 'item1', name: 'Item 1', roomId: 'room1' }],
      isLoading: false,
      error: null,
      refetch: () => {},
    });

    render(<TaskForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/home/i)).toHaveValue('home1');
    });
  });

  it('should clear dependent fields when parent selection changes', async () => {
    render(<TaskForm {...defaultProps} defaultItemId="item1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/home/i)).toHaveValue('home1');
      expect(screen.getByLabelText(/room/i)).toHaveValue('room1');
      expect(screen.getByLabelText(/item/i)).toHaveValue('item1');
    });

    // Change home selection
    fireEvent.change(screen.getByLabelText(/home/i), { target: { value: 'home2' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/room/i)).toHaveValue('');
      expect(screen.getByLabelText(/item/i)).toHaveValue('');
    });
  });
});
