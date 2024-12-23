import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { getServerSession } from 'next-auth';
import { getUserHomes } from '@/lib/home.utils';
import { getRecentTasks } from '@/lib/task.utils';
import '@testing-library/jest-dom';
import { redirect } from 'next/navigation';

// Mock the modules
jest.mock('next-auth');
jest.mock('@/lib/home.utils');
jest.mock('@/lib/task.utils');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
  },
}));

// Mock data
const mockHomes = [
  {
    id: '1',
    name: 'Test Home',
    address: '123 Test St',
    _count: {
      rooms: 2,
      tasks: 3,
    },
    owner: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Test Task',
    status: 'PENDING',
    priority: 'MEDIUM',
    creator: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
    });
    (getUserHomes as jest.Mock).mockResolvedValue(mockHomes);
    (getRecentTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('renders the dashboard with homes and tasks', async () => {
    const page = await DashboardPage();
    render(page);

    // Check for main sections
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Your Homes')).toBeInTheDocument();
    expect(screen.getByText('Recent Tasks')).toBeInTheDocument();

    // Check for home data
    expect(screen.getByText('Test Home')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('2 Rooms')).toBeInTheDocument();
    expect(screen.getByText('3 Tasks')).toBeInTheDocument();

    // Check for stats
    expect(screen.getByText('Total Homes')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total homes count
  });

  it('redirects to signin when user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    await DashboardPage();
    expect(redirect).toHaveBeenCalledWith('/auth/signin');
  });

  it('shows empty state when no homes exist', async () => {
    (getUserHomes as jest.Mock).mockResolvedValue([]);
    
    const page = await DashboardPage();
    render(page);

    expect(screen.getByText("You haven't added any homes yet.")).toBeInTheDocument();
  });

  it('shows empty state when no tasks exist', async () => {
    (getRecentTasks as jest.Mock).mockResolvedValue([]);
    
    const page = await DashboardPage();
    render(page);

    expect(screen.getByText("You don't have any active tasks.")).toBeInTheDocument();
  });
}); 