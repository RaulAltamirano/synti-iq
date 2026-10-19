import type { AutocompleteOption } from '@/modules/ui/components';

/**
 * Cajeros de demostración para el autocomplete (sin llamar al API).
 * `value` = `profileId` del perfil tipo cajero (UUID de `cashier_profiles`).
 */
export const MOCK_CASHIER_AUTOCOMPLETE_OPTIONS: AutocompleteOption<string>[] = [
  {
    label: 'Ana López',
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ana.lopez@cajero.demo',
    avatarName: 'Ana López',
  },
  {
    label: 'Carlos Ruiz',
    value: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    description: 'carlos.ruiz@cajero.demo',
    avatarName: 'Carlos Ruiz',
  },
  {
    label: 'María Fernández',
    value: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    description: 'maria.fernandez@cajero.demo',
    avatarName: 'María Fernández',
  },
  {
    label: 'Diego Martín',
    value: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    description: 'diego.martin@cajero.demo',
    avatarName: 'Diego Martín',
  },
  {
    label: 'Laura Sánchez',
    value: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    description: 'laura.sanchez@cajero.demo',
    avatarName: 'Laura Sánchez',
  },
  {
    label: 'Javier Torres',
    value: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    description: 'javier.torres@cajero.demo',
    avatarName: 'Javier Torres',
  },
  {
    label: 'Elena Vargas',
    value: 'a7b8c9d0-e1f2-3456-0123-567890123456',
    description: 'elena.vargas@cajero.demo',
    avatarName: 'Elena Vargas',
  },
  {
    label: 'Pablo Iglesias',
    value: 'b8c9d0e1-f2a3-4567-1234-678901234567',
    description: 'pablo.iglesias@cajero.demo',
    avatarName: 'Pablo Iglesias',
  },
  {
    label: 'Lucía Moreno',
    value: 'c9d0e1f2-a3b4-5678-2345-789012345678',
    description: 'lucia.moreno@cajero.demo',
    avatarName: 'Lucía Moreno',
  },
  {
    label: 'Roberto Campos',
    value: 'd0e1f2a3-b4c5-6789-3456-890123456789',
    description: 'roberto.campos@cajero.demo',
    avatarName: 'Roberto Campos',
  },
  {
    label: 'Sofía Herrera',
    value: 'e1f2a3b4-c5d6-7890-4567-901234567890',
    description: 'sofia.herrera@cajero.demo',
    avatarName: 'Sofía Herrera',
  },
  {
    label: 'Miguel Ángel Ríos',
    value: 'f2a3b4c5-d6e7-8901-5678-012345678901',
    description: 'miguel.rios@cajero.demo',
    avatarName: 'Miguel Ángel Ríos',
  },
  {
    label: 'Carmen Delgado',
    value: 'a3b4c5d6-e7f8-9012-6789-123456789012',
    description: 'carmen.delgado@cajero.demo',
    avatarName: 'Carmen Delgado',
  },
  {
    label: 'Fernando Castro',
    value: 'b4c5d6e7-f8a9-0123-7890-234567890123',
    description: 'fernando.castro@cajero.demo',
    avatarName: 'Fernando Castro',
  },
  {
    label: 'Isabel Navarro',
    value: 'c5d6e7f8-a9b0-1234-8901-345678901234',
    description: 'isabel.navarro@cajero.demo',
    avatarName: 'Isabel Navarro',
  },
  {
    label: 'Hugo Méndez',
    value: 'd6e7f8a9-b0c1-2345-9012-456789012345',
    description: 'hugo.mendez@cajero.demo',
    avatarName: 'Hugo Méndez',
  },
  {
    label: 'Patricia Ortega',
    value: 'e7f8a9b0-c1d2-3456-0123-567890123456',
    description: 'patricia.ortega@cajero.demo',
    avatarName: 'Patricia Ortega',
  },
  {
    label: 'Andrés Gil',
    value: 'f8a9b0c1-d2e3-4567-1234-678901234567',
    description: 'andres.gil@cajero.demo',
    avatarName: 'Andrés Gil',
  },
  {
    label: 'Rosa Jiménez',
    value: 'a9b0c1d2-e3f4-5678-2345-789012345678',
    description: 'rosa.jimenez@cajero.demo',
    avatarName: 'Rosa Jiménez',
  },
];

function matchesQuery(
  option: AutocompleteOption<string>,
  normalizedQuery: string
): boolean {
  const label = option.label.toLowerCase();
  const desc = (option.description ?? '').toLowerCase();
  return label.includes(normalizedQuery) || desc.includes(normalizedQuery);
}

/**
 * Filtra la lista mock por nombre o correo (subcadena, sin API).
 */
export function filterMockCashierOptions(
  query: string
): AutocompleteOption<string>[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return MOCK_CASHIER_AUTOCOMPLETE_OPTIONS.filter((o) => matchesQuery(o, q));
}

/** Misma firma que `searchCashiersByName` para poder intercambiar por API si hace falta. */
export async function fetchCashierSuggestionsMock(
  query: string
): Promise<AutocompleteOption<string>[]> {
  return Promise.resolve(filterMockCashierOptions(query));
}
