import { useQuery } from '@apollo/client';
import { GET_DATABASES } from '../graphql/queries';
import type { Database } from '../types/schema';

/**
 * DatabaseList Component
 * Epic 1.4: Schema Explorer UI
 *
 * Displays a list of all databases with loading and error states
 */

interface GetDatabasesResponse {
  databases: Pick<Database, 'id' | 'name' | 'path' | 'addedAt'>[];
}

interface DatabaseListProps {
  onDatabaseSelect?: (databaseId: string) => void;
}

export function DatabaseList({
  onDatabaseSelect,
}: DatabaseListProps = {}): JSX.Element {
  const { loading, error, data } =
    useQuery<GetDatabasesResponse>(GET_DATABASES);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-400">Loading databases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-400">Error loading databases: {error.message}</p>
      </div>
    );
  }

  if (!data?.databases || data.databases.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-400">No databases found</p>
      </div>
    );
  }

  const handleDatabaseClick = (databaseId: string): void => {
    onDatabaseSelect?.(databaseId);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Databases</h2>
      <ul className="space-y-2">
        {data.databases.map((database) => (
          <li
            key={database.id}
            onClick={() => handleDatabaseClick(database.id)}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-primary-400">
              {database.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{database.path}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
