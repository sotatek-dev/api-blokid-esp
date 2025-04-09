import { GetSelect } from '@prisma/client/runtime/library';
import { _ } from 'src/core/libs/lodash';

export function selectSameAsObject<T>(
  dto: any,
): GetSelect<Record<keyof T, boolean>, any> {
  const keys = Object.keys(dto);
  // @ts-ignore
  return _.zipObject(keys, Array(keys.length).fill(true));
}
