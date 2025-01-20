interface IResponse<T> {
  data: {
    code: number;
    message: string;
    data: T
  }
};

export default IResponse;