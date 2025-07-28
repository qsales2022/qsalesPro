// /* eslint-disable no-catch-shadow */
// import {useEffect, useState} from 'react';
// import {useDispatch} from 'react-redux';
// import {toggleLoader} from '../../../redux/reducers/GlobalReducer';
// import axios from 'axios';

// const useDealBlock = () => {
//   const [deals, setDeals] = useState<any | null>(null);
//   const [dealLoading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const dispatch = useDispatch();

//   const getDeals = async (productId: any) => {
//     console.log('Checking deals...');
//     dispatch(toggleLoader(true));

//     try {
//       // const response = await axios
//       //   .create({
//       //     baseURL: `https://kachingappz-bundles.herokuapp.com/storefront_api/deal_blocks?shop=qsales-online-shopping.myshopify.com`,
//       //   })
//       //   .get('');
//       // console.log(response, 'done deal >>>>>');
//       const response = await axios.post(
//         'https://qsales-online-shopping.myshopify.com/api/2025-04/graphql.json?operation_name=FetchDealBlocks',
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Shopify-Storefront-Access-Token':
//               'c8359c68f8402abb41d906daf4ef5e95',
//           },
//         },
//       );

//       interface Block {
//         selectedProductIds: number[];
//       }

//       const data: Block[] = response.data.deal_blocks;
//       const matchingArrays: Block[] = [];

//       const targetProductId: number = parseInt(productId, 10);
//       if (!isNaN(targetProductId)) {
//         data.forEach((block: Block) => {
//           if (block.selectedProductIds.includes(targetProductId)) {
//             matchingArrays.push(block);
//           }
//         });
//       } else {
//         console.error('Invalid productId', productId);
//       }

//       console.log('Deals: match found', matchingArrays);

//       setDeals(matchingArrays.length > 0 ? matchingArrays[0] : null);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     } catch (error: any) {
//       console.error('Error fetching deals:', error);
//       setError(error);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return {dealLoading, deals, getDeals, setDeals};
// };

// export default useDealBlock;

// const fetchDealBlocks = async () => {
//   const query = `
//     query {
//       shop {
//         metafield(namespace: "app--2935586817--kaching_bundles", key: "deal_blocks") {
//           value
//         }
//       }
//     }
//   `;

//   const response = await fetch('https://your-shop-name.myshopify.com/api/2023-10/graphql.json', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Storefront-Access-Token': 'your-storefront-token',
//     },
//     body: JSON.stringify({ query }),
//   });

//   const json = await response.json();
//   const dealBlocks = JSON.parse(json.data.shop.metafield.value);
//   return dealBlocks;
// };

/* eslint-disable no-catch-shadow */
//wroking bundle

// import {useState} from 'react';
// import {useDispatch} from 'react-redux';
// import {toggleLoader} from '../../../redux/reducers/GlobalReducer';
// import graphqlClient from '../../interceptor';

// const useDealBlock = () => {
//   const [deals, setDeals] = useState<any | null>(null);
//   const [dealLoading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const dispatch = useDispatch();

//   const getDeals = async (productId: string) => {
//     console.log(productId, 'Checking deals...productId');
//     dispatch(toggleLoader(true));

//     try {
//       const query = `
//         query {
//           shop {
//             metafield(namespace: "app--2935586817--kaching_bundles", key: "deal_blocks") {
//               value
//             }
//           }
//         }
//       `;

//       const response = await graphqlClient.post('', {query});
//       // console.log(response?.data?.shop, 'respo>>>>><<><><');

//       const rawValue = response?.data?.shop?.metafield?.value;

//       const data = JSON.parse(rawValue);
//        console.log(data,'))))))');

//       const targetProductId: number = parseInt(productId, 10);

//       const matchingBlocks = data.filter((block: any) => {
//         // console.log(
//         //   'starting her--->>,',
//         //   block.selectedProductIds,
//         //   'enindg bro',
//         //   targetProductId,
//         // );
//          console.log( block.dealType,'=+++++');

//         const match = block.selectedProductIds?.includes(targetProductId);

//         return match;
//       });
//       // console.log(matchingBlocks, '_____>>>>>>');

//       setDeals(matchingBlocks.length > 0 ? matchingBlocks[0] : null);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     } catch (err: any) {
//       console.error('Error fetching deals:', err);
//       setError(err);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return {dealLoading, deals, getDeals, setDeals};
// };

// export default useDealBlock;

import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {toggleLoader} from '../../../redux/reducers/GlobalReducer';
import graphqlClient from '../../interceptor';
import { getNoFromId } from '../../../Theme/Constants';



const useDealBlock = () => {
  const [deals, setDeals] = useState<any | null>(null);
  const [dealLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const getDeals = async (productId: string) => {
    dispatch(toggleLoader(true));
    setLoading(true);
    try {
      const shopifyProductId = `gid://shopify/Product/${productId}`;

      // Step 1: Get collections of the product
      const productQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          collections(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;

      const productRes = await graphqlClient.post('', {
        query: productQuery,
        variables: {id: shopifyProductId},
      });

      const collectionIds = productRes?.data?.product?.collections?.edges?.map(
        (edge: any) => edge.node.id,
      );

      // Step 2: Get metafield deal blocks
      const metafieldQuery = `
      query {
        shop {
          metafield(namespace: "app--2935586817--kaching_bundles", key: "deal_blocks") {
            value
          }
        }
      }
    `;
      const response = await graphqlClient.post('', {query: metafieldQuery});
      const rawValue = response?.data?.shop?.metafield?.value;
      const data = JSON.parse(rawValue);
      
      const targetProductId = parseInt(productId, 10);
    
      // Step 3: Match deals based on productId or collectionId
      const matchingBlocks = data.filter((block: any) => {
        const productMatch =
          block.selectedProductIds?.includes(targetProductId);

        const collectionMatch = block.selectedCollectionIds?.some(
          (colId: string) => (
            collectionIds?.includes(`gid://shopify/Collection/${colId}`)
          )
        );
        const hasBogoDeal = block.dealBars?.some(
          (dealBar: any) =>
            dealBar.dealBarType === 'bxgy' && (productMatch || collectionMatch),
        );

        return productMatch || collectionMatch || hasBogoDeal;
      });

      setDeals(matchingBlocks.length > 0 ? matchingBlocks[0] : null);
      setLoading(false);
      dispatch(toggleLoader(false));
    } catch (err: any) {
      console.error('Error fetching deals:', err);
      setError(err);
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return {dealLoading, deals, getDeals, setDeals};
};

export default useDealBlock;
