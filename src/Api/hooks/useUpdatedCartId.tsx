import axios from 'axios';
import { useState } from 'react';

export const useUpdatedCartId = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const updatedCartId = async (cartid: any, fcmtoken: string) => {
    let response: any;
    console.log('ge>>><<>>');

    try {
      setLoading(true);
      response = await axios
        .create({
            // baseURL: 'https://qdelivery.online/user/',
          baseURL: 'http://192.168.10.68:4001/user',
          headers: {
            'Content-Type': 'application/json',
            // Origin: 'http://localhost:8081',
          },
        })
        .post('/cart', { cartId: cartid, fcmtoken });

      // const response = await axios.get('http://192.168.8.123:4000/user/order?sreachText=cheking77')
      console.log(response?.data, 'responseresponse');

      return response?.data;
    } catch (error: any) {
      console.log(error.message, 'errorerror');
      
      const errorCode = error?.response?.status;
      return errorCode;
    } finally {
      setLoading(false);
    }
  };

  return { updatedCartId, loading };
};
