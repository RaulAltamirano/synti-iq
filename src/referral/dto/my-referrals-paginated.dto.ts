import type { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import type { ReferralRecordDto } from './referral-record.dto';

export type MyReferralsPaginatedDto = PaginatedResponse<ReferralRecordDto>;
