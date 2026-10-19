/**
 * Optional context when creating role-specific profiles inside a transaction.
 * For {@link SystemRole.CASHIER}, {@link actingBusinessProfileId} must match
 * {@link Store.businessProfileId} for the target store.
 */
export interface ProfileCreationContext {
  actingBusinessProfileId?: string;
}
