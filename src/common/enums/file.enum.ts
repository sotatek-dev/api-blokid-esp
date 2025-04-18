/**
 * Mime types which this server is going to accept
 **/
export enum MimeType {
  Gzip = 'application/gzip', // Note: sometimes application/x-gzip
  Json = 'application/json',
  LdJson = 'application/ld+json',
  MsWord = 'application/msword',
  OctetStream = 'application/octet-stream',
  Pdf = 'application/pdf',
  AmazonEbook = 'application/vnd.amazon.ebook',
  MsExcel = 'application/vnd.ms-excel',
  MsPowerpoint = 'application/vnd.ms-powerpoint',
  Pptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  Xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  Docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  Rar = 'application/vnd.rar',
  Zip = 'application/zip',
  AudioAac = 'audio/aac',
  AudioMpeg = 'audio/mpeg',
  AudioWav = 'audio/wav',
  AudioWebm = 'audio/webm',
  ImageBmp = 'image/bmp',
  ImageGif = 'image/gif',
  ImageJpeg = 'image/jpeg', // .jpeg, .jpg
  ImagePng = 'image/png',
  ImageSvgXml = 'image/svg+xml',
  ImageWebp = 'image/webp',
  Css = 'text/css',
  Csv = 'text/csv',
  Html = 'text/html', // .htm, .html
  Javascript = 'text/javascript', // .js, .mjs
  TextPlain = 'text/plain', // .txt
  VideoMp4 = 'video/mp4',
  VideoMpeg = 'video/mpeg',
  VideoWebm = 'video/webm',
}
