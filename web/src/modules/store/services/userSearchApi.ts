import { ApiService } from '@/modules/services/api-service';
import type { AxiosError } from 'axios';
import type { PaginatedResponse } from '@/modules/store/types/store-api.types';
import type { UserFilterItemApi } from '@/modules/store/types/user-search.types';
import type { AutocompleteOption } from '@/modules/ui/components';

const api = ApiService.getInstance().api;

const CASHIER_ROLE = 'cashier';

function unwrapSuccessData<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === 'object' &&
    'status' in body &&
    (body as { status: string }).status === 'success' &&
    'data' in body
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function getAxiosMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const ax = err as AxiosError<{ message?: string | string[] }>;
    const msg = ax.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

/**
 * Busca usuarios con rol cajero por nombre (subcadena).
 * Usa el `profileId` del perfil tipo cajero como ID de `cashier_profiles` para asignar a tienda.
 */
export async function searchCashiersByName(
  query: string
): Promise<AutocompleteOption<string>[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const { data } = await api.get<unknown>('/user', {
      params: {
        name: q,
        page: 1,
        limit: 20,
        roles: [CASHIER_ROLE],
      },
    });
    const body = unwrapSuccessData<PaginatedResponse<UserFilterItemApi>>(data);
    const items = body.items ?? [];

    const out: AutocompleteOption<string>[] = [];
    for (const u of items) {
      const pt = u.profile?.profileType;
      const pid = u.profile?.profileId;
      if (pt !== CASHIER_ROLE || !pid) continue;

      const displayName = `${u.firstName} ${u.lastName}`.trim() || u.email;
      out.push({
        label: displayName,
        value: pid,
        description: u.email,
        avatarName: displayName,
      });
    }
    return out;
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}
