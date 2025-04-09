export enum NODE_ENV {
  LOCAL = 'local',
  TEST = 'test',
  DEVELOPMENT = 'development',
  SANDBOX = 'sandbox',
  PREPRODUCTION = 'preproduction',
  PRODUCTION = 'production',
}

/**
 * Request body content type which corresponding to header content-type
 **/
export enum BodyContentType {
  Json = 'application/json',
  MultipartFormData = 'multipart/form-data',
}
