import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { ReferralRecordDto } from './referral-record.dto';

export type MyReferralsPaginatedDto = PaginatedResponse<ReferralRecordDto>;
