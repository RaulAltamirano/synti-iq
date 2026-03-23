import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { ReferralValidationResponseDto } from 'src/referral/dto/referral-validation-response.dto';
import { MyReferralCodeDto } from 'src/referral/dto/my-referral-code.dto';
import { MyReferrerResponseDto } from 'src/referral/dto/referrer-info.dto';
import { ReferralStatsDto, ReferralRecordDto } from 'src/referral/dto/referral-record.dto';

export const referralEndpoints: Record<string, EndpointDocSpec> = {
  getMyCode: {
    summary: 'Get my referral code (business owner only)',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Returns the current user referral code with usage count',
        type: MyReferralCodeDto,
      },
      {
        status: 403,
        description: 'Only business owners can access referral codes',
      },
    ],
  },
  generateCode: {
    summary: 'Generate or retrieve referral code (business owner only)',
    cookieAuth: true,
    responses: [
      {
        status: 201,
        description: 'Referral code created or retrieved successfully',
        type: MyReferralCodeDto,
      },
      {
        status: 403,
        description: 'Only business owners can generate referral codes',
      },
    ],
  },
  getMyReferrer: {
    summary: 'Get who referred me',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Returns the referrer info or null if not referred',
        type: MyReferrerResponseDto,
      },
    ],
  },
  getMyReferralsStats: {
    summary: 'Get referral statistics (business owner only)',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Returns referral stats (total, successful, pending, benefits)',
        type: ReferralStatsDto,
      },
      {
        status: 403,
        description: 'Only business owners can access referral stats',
      },
    ],
  },
  getMyReferrals: {
    summary: 'Get paginated list of my referrals (business owner only)',
    cookieAuth: true,
    query: [
      { name: 'page', description: 'Page number (default: 1)', type: 'number' },
      { name: 'limit', description: 'Items per page (default: 20, max: 100)', type: 'number' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of referred users',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponseDto' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ReferralRecordDto' },
                },
              },
            },
          ],
        },
      },
      {
        status: 403,
        description: 'Only business owners can access referral list',
      },
    ],
  },
  validateCode: {
    summary: 'Validate a referral code (public, no auth)',
    params: [
      {
        name: 'code',
        description: 'Referral code to validate (6-12 alphanumeric characters)',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Validation result with referrer info and benefits when valid',
        type: ReferralValidationResponseDto,
      },
    ],
  },
};
