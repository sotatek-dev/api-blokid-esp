import { _ } from 'src/core/libs/lodash';

export function convertErrorToObject(error: any) {
  if (!error) return null;
  return _.pick(error, Object.getOwnPropertyNames(error));
}
