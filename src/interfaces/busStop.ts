import IBase from "./base";

interface IBusStop extends IBase {
  name: string;
  longitude: number;
  latitude: number;
  streetId: string;
};

export default IBusStop;
