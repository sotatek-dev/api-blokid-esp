import { ERROR_RESPONSE } from 'src/common/const';
import { PaginationQueryDto } from 'src/core/platform/dtos';
import { ServerException } from 'src/exceptions';

export function validatePaginationQueryDto<T extends PaginationQueryDto>(query: T) {
  const { pageSize, page, lastItemId } = query;

  if (!lastItemId && !page) {
    throw new ServerException({
      ...ERROR_RESPONSE.UNPROCESSABLE_ENTITY,
      message: `page or lastItemId is required depending on the query type (page-based or cursor-based)`,
      details: { query },
    });
  }

  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, take, skip };
}
