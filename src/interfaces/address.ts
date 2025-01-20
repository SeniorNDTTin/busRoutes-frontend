import IBase from "./base";

interface IAddress extends IBase {
  street: string;
  ward: string;
  district: string;
}

export default IAddress;