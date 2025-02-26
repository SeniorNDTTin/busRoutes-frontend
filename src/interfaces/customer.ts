import IBase from "./base";

interface ICustomer extends IBase {
    fullName: string;
    phone: string;
    email: string;
};

export default ICustomer;