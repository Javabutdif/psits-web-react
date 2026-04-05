export interface IResponseMessage<T = null> {
  status: boolean;
  data?: T;
  message: string;
}
