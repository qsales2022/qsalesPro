/* eslint-disable no-catch-shadow */
// useGetBestSelling.js
import {useEffect, useState} from 'react';
import graphqlClient from '../interceptor';
import { useDispatch } from 'react-redux';
import { toggleLoader } from '../../redux/reducers/GlobalReducer';

const useRemoveFromCart = () => {
  const [removeCartData, setRemoveCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const removeFromCart = async (checkoutId:any,lineItemId:any) => {
    dispatch(toggleLoader(true));
    try {
      const response = await graphqlClient.post('', {
        query: `mutation {
          cartLinesRemove(cartId: "${checkoutId}", lineIds: ["${lineItemId}"]) {
            cart {
              id
              lines(first: 5) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        title
                        product {
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              message
            }
          }
        }`
      });
      
      

      const {data} = response;
      
      setRemoveCartData(data);
      setLoading(false);
      dispatch(toggleLoader(false));
    } catch (error: any) {
      setError(error);
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return {removeCartData,removeFromCart};
};

export default useRemoveFromCart;
