import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Home, Item, Room } from '@/types/prisma';

interface LocationOptions {
  homes: Array<{
    id: string;
    name: string;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    homeId: string;
  }>;
  items: Array<{
    id: string;
    name: string;
    roomId: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useLocationOptions() {
  const { data: session } = useSession();
  const [homes, setHomes] = useState<LocationOptions['homes']>([]);
  const [rooms, setRooms] = useState<LocationOptions['rooms']>([]);
  const [items, setItems] = useState<LocationOptions['items']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [homesRes, roomsRes, itemsRes] = await Promise.all([
          fetch('/api/homes'),
          fetch('/api/rooms'),
          fetch('/api/items'),
        ]);

        if (!homesRes.ok || !roomsRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch location options');
        }

        const [homesData, roomsData, itemsData] = await Promise.all([
          homesRes.json(),
          roomsRes.json(),
          itemsRes.json(),
        ]);

        setHomes(homesData.map((home: Home) => ({ id: home.id, name: home.name })));
        setRooms(
          roomsData.map((room: Room) => ({ id: room.id, name: room.name, homeId: room.homeId }))
        );
        setItems(
          itemsData.map((item: Item) => ({ id: item.id, name: item.name, roomId: item.roomId }))
        );
      } catch (error) {
        console.error('Error fetching location options:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch location options');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLocations();
  }, [session]);

  return {
    homes,
    rooms,
    items,
    isLoading,
    error,
  };
}
