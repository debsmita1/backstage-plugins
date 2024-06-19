export interface HandlerResponse<ResponseBody = any> {
  statusCode: number;
  responseBody?: ResponseBody;
}
