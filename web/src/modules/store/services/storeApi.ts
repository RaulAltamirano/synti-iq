import { ApiService } from '@/modules/services/api-service';
import type { AxiosError } from 'axios';
import type { CreateStoreFormPayload } from '@/modules/store/types/store-form.types';
import type {
  CashierProfileApi,
  ListStoresParams,
  PaginatedResponse,
  StoreApi,
} from '@/modules/store/types/store-api.types';

/** Query params for GET /store/:id/cashiers (paginated). */
export interface PaginatedStoreCashiersParams {
  page?: number;
  limit?: number;
  /** API: id | cashierNumber | branchOffice | lastActivityAt | isApproved */
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** Query params for GET /store/:id/cashiers/assignment-candidates. */
export interface CashierAssignmentCandidatesParams {
  q: string;
  page?: number;
  limit?: number;
}

const api = ApiService.getInstance().api;

/**
 * Nest `ResponseInterceptor` wraps JSON as `{ status: 'success', data, meta }`.
 * Axios exposes that as `response.data`, so the real payload is `response.data.data`.
 */
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

function buildStoreQuery(params: ListStoresParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  if (params.name?.trim()) q.set('name', params.name.trim());
  if (params.isActive !== undefined) q.set('isActive', String(params.isActive));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listStores(params: ListStoresParams): Promise<PaginatedResponse<StoreApi>> {
  try {
    const { data } = await api.get<unknown>(`/store${buildStoreQuery(params)}`);
    return unwrapSuccessData<PaginatedResponse<StoreApi>>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

export async function getStoreById(id: string): Promise<StoreApi> {
  try {
    const { data } = await api.get<unknown>(`/store/${encodeURIComponent(id)}`);
    return unwrapSuccessData<StoreApi>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

export async function createStore(payload: CreateStoreFormPayload): Promise<StoreApi> {
  try {
    const { data } = await api.post<unknown>('/store', payload);
    return unwrapSuccessData<StoreApi>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

export async function deleteStore(id: string): Promise<void> {
  try {
    await api.delete(`/store/${encodeURIComponent(id)}`);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

function buildStoreCashiersQuery(params: PaginatedStoreCashiersParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  const s = q.toString();
  return s ? `?${s}` : '';
}

function buildAssignmentCandidatesQuery(params: CashierAssignmentCandidatesParams): string {
  const q = new URLSearchParams();
  q.set('q', params.q.trim());
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  return `?${q.toString()}`;
}

/**
 * Lista paginada de cajeros de la tienda (GET /store/:id/cashiers).
 * Incluye `user` cuando el API hace join (misma respuesta que Postman).
 */
export async function getStoreCashiersPaginated(
  storeId: string,
  params: PaginatedStoreCashiersParams = {}
): Promise<PaginatedResponse<CashierProfileApi>> {
  try {
    const { data } = await api.get<unknown>(
      `/store/${encodeURIComponent(storeId)}/cashiers${buildStoreCashiersQuery(params)}`
    );
    return unwrapSuccessData<PaginatedResponse<CashierProfileApi>>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

/**
 * Cajeros del mismo negocio que aún no están en esta tienda (búsqueda para asignar).
 * GET /store/:id/cashiers/assignment-candidates
 */
export async function getStoreCashierAssignmentCandidates(
  storeId: string,
  params: CashierAssignmentCandidatesParams
): Promise<PaginatedResponse<CashierProfileApi>> {
  try {
    const { data } = await api.get<unknown>(
      `/store/${encodeURIComponent(storeId)}/cashiers/assignment-candidates${buildAssignmentCandidatesQuery(params)}`
    );
    return unwrapSuccessData<PaginatedResponse<CashierProfileApi>>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

export async function assignCashierToStore(storeId: string, cashierId: string): Promise<boolean> {
  try {
    const { data } = await api.post<unknown>(`/store/${encodeURIComponent(storeId)}/cashiers`, {
      cashierId,
    });
    return unwrapSuccessData<boolean>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}

export async function removeCashiersFromStore(
  storeId: string,
  cashierIds: string[]
): Promise<{ removed: number }> {
  try {
    const { data } = await api.post<unknown>(
      `/store/${encodeURIComponent(storeId)}/cashiers/remove`,
      { cashierIds }
    );
    return unwrapSuccessData<{ removed: number }>(data);
  } catch (e) {
    throw new Error(getAxiosMessage(e));
  }
}
