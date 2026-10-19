import type { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import type { TemplateItemResponseDto } from './template-item-response.dto';

export type TemplateItemPaginatedDto = PaginatedResponse<TemplateItemResponseDto>;
