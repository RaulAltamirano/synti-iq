/**
 * Respuestas de GET /user (filtros) alineadas con el API Nest.
 */

export interface UserProfileSnippetApi {
  id: string;
  profileType: string;
  profileId: string | null;
}

export interface UserFilterItemApi {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: UserProfileSnippetApi | null;
}
