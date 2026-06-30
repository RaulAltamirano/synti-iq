import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { CreateUnassignedCashierAccountDto } from 'src/cashier-profile/dto/create-unassigned-cashier-account.dto';
import { CreateCashierAccountResponseDto } from 'src/store/dto/create-cashier-account-response.dto';

export const cashierProfileEndpoints: Record<string, EndpointDocSpec> = {
  createUnassignedCashierAccount: {
    summary: 'Create a cashier account without a store assignment',
    description:
      "Creates a user with role CASHIER scoped to the authenticated business owner's business. No store is assigned at creation — use POST /store/:id/cashiers to assign one later. An invitation email is sent for the cashier to set their password.",
    operationId: 'cashierCreateUnassigned',
    cookieAuth: true,
    body: CreateUnassignedCashierAccountDto,
    responses: [
      {
        status: 201,
        description: 'Cashier account created',
        type: CreateCashierAccountResponseDto,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
};
