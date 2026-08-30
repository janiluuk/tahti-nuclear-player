import { SearchIcon, UserRoundIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@nuclearplayer/ui';

import { fetchAdminUsers, type AdminUserRow } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { AdminUserEditPanel } from '../../components/AdminUserEditPanel';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const ROLES = ['', 'BOARD', 'ARTIST', 'LISTENER'] as const;

export const AdminUsersView = () => {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [isMember, setIsMember] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      void fetchAdminUsers({ q: query, role, isMember }).then((result) => {
        setUsers(result.data);
        setTotal(result.total);
        setSelectedId((current) => {
          if (current && result.data.some((user) => user.id === current)) {
            return current;
          }
          return result.data[0]?.id ?? null;
        });
        setLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query, role, isMember]);

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-7xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/users" />
        <StudioPageHeader
          title="User management"
          subtitle={`${total} accounts · details, access, and communication`}
        />

        <div className="grid min-h-[36rem] gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <StudioPanel className="flex min-h-0 flex-col gap-3">
            <div className="relative">
              <SearchIcon
                size={15}
                aria-hidden
                className="text-foreground-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                aria-label="Search users"
                placeholder="Name, email, or username"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="Filter by role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="border-border bg-background rounded-md border px-2 py-2 text-sm"
              >
                {ROLES.map((value) => (
                  <option key={value} value={value}>
                    {value
                      ? value.charAt(0) + value.slice(1).toLowerCase()
                      : 'All roles'}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by membership"
                value={isMember}
                onChange={(event) => setIsMember(event.target.value)}
                className="border-border bg-background rounded-md border px-2 py-2 text-sm"
              >
                <option value="">All accounts</option>
                <option value="true">Members</option>
                <option value="false">Non-members</option>
              </select>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <PageLoading label="Loading users…" />
              ) : users.length === 0 ? (
                <p className="text-foreground-secondary p-3 text-sm">
                  No users match these filters.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(user.id)}
                        aria-pressed={selectedId === user.id}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedId === user.id
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-border hover:bg-background-secondary border-transparent'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {user.displayName}
                          </span>
                          <span className="text-foreground-secondary shrink-0 text-[10px] font-semibold tracking-wide uppercase">
                            {user.role.charAt(0) +
                              user.role.slice(1).toLowerCase()}
                          </span>
                        </span>
                        <span className="text-foreground-secondary block truncate text-xs">
                          @{user.username}
                          {user.suspendedAt ? ' · suspended' : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </StudioPanel>

          <div className="min-w-0">
            {!selectedId ? (
              <StudioPanel className="flex min-h-72 items-center justify-center">
                <div className="text-center">
                  <UserRoundIcon
                    size={28}
                    aria-hidden
                    className="text-foreground-secondary mx-auto mb-2"
                  />
                  <p className="text-foreground-secondary text-sm">
                    Select a user to view and edit their account.
                  </p>
                </div>
              </StudioPanel>
            ) : (
              <AdminUserEditPanel
                key={selectedId}
                userId={selectedId}
                onUserUpdated={(user) =>
                  setUsers((current) =>
                    current.map((row) =>
                      row.id === user.id
                        ? {
                            ...row,
                            role: user.role,
                            tier: user.tier,
                            isMember: user.isMember,
                            isBoard: user.isBoard,
                            memberNumber: user.memberNumber,
                            suspendedAt: user.suspendedAt,
                          }
                        : row,
                    ),
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
};
