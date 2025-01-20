import { useEffect, useState } from "react";

import IAddress from "../../interfaces/address";

import addressService from "../../services/address..service";

function Home() {
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      const addresses = (await addressService.get()).data;
      setAddresses(addresses);
    }
    fetchApi();
  }, []);

  return (
    <>
      {addresses.length && addresses.map((item, index) => (
        <h1 key={index}>{item.street}</h1>
      ))}
    </>
  );
}

export default Home;