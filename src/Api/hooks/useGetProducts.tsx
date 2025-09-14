// // useGetProducts.ts
// import { useEffect, useState } from "react";
// import graphqlClient from "../interceptor";
// import { useDispatch, useSelector } from "react-redux";
// import { toggleLoader } from "../../redux/reducers/GlobalReducer";
// import { RootState } from "../../redux/store";

// export type sortKeyType =
//   | "MANUAL"
//   | "PRICE_ASC"
//   | "PRICE_DESC"
//   | "TITLE_ASC"
//   | "TITLE_DESC"
//   | "BEST_SELLING"
//   | "CREATED_AT_ASC"
//   | "CREATED_AT_DESC";

// const useGetProducts = (
//   handle: string | null,
//   count: number,
//   search: string | null = null,
//   sortKey: sortKeyType = "MANUAL"
// ) => {
//   const { language = "EN" } = useSelector(
//     (state: RootState) => state.AuthReducer
//   );
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<null | Error>(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const getProducts = async () => {
//       dispatch(toggleLoader(true));
//       try {
//         // Map your custom sort keys to Shopify API accepted sort keys
//         let apiSortKey: string;
//         switch (sortKey) {
//           case "PRICE_ASC":
//           case "PRICE_DESC":
//             apiSortKey = "PRICE";
//             break;
//           case "TITLE_ASC":
//           case "TITLE_DESC":
//             apiSortKey = "TITLE";
//             break;
//           case "CREATED_AT_ASC":
//           case "CREATED_AT_DESC":
//             apiSortKey = "CREATED";
//             break;
//           case "BEST_SELLING":
//             apiSortKey = "BEST_SELLING";
//             break;
//           case "MANUAL":
//           default:
//             apiSortKey = "MANUAL";
//             break;
//         }

//         const response = await graphqlClient.post("", {
//           query: `
//             query GetProductsInCollection($handle: String!, $count: Int!, $sortKey: ProductCollectionSortKeys!) 
//             @inContext(language: ${language.toUpperCase()}) {
//               collection(handle: $handle) {
//                 id
//                 title
//                 products(first: $count, sortKey: $sortKey) {
//                   edges {
//                     node {
//                       id
//                       title
//                       handle
//                       vendor
//                       availableForSale
//                       tags
//                       images(first: 1) {
//                         edges {
//                           node {
//                             id
//                             url
//                             width
//                             height
//                             altText
//                           }
//                         }
//                       }
//                       priceRange {
//                         minVariantPrice {
//                           amount
//                           currencyCode
//                         }
//                         maxVariantPrice {
//                           amount
//                           currencyCode
//                         }
//                       }
//                       variants(first: 1) {
//                         edges {
//                           node {
//                             compareAtPrice {
//                               amount
//                               currencyCode
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           `,
//           variables: {
//             handle: handle,
//             count: count,
//             sortKey: apiSortKey,
//           },
//         });

//         const productsData = response.data?.collection?.products?.edges || [];

//         // Reverse client-side for descending sorts
//         const finalProducts =
//           sortKey === "PRICE_DESC" ||
//           sortKey === "TITLE_DESC" ||
//           sortKey === "CREATED_AT_DESC"
//             ? [...productsData].reverse()
//             : productsData;

//         setProducts(finalProducts);
//         setLoading(false);
//         dispatch(toggleLoader(false));
//       } catch (error: any) {
//         setError(error);
//         setLoading(false);
//         dispatch(toggleLoader(false));
//       }
//     };

//     getProducts();
//   }, [handle, count, language, sortKey, dispatch]);

//   return { products, loading, error };
// };

// export default useGetProducts;



// useGetProducts.ts
import { useEffect, useState } from "react";
import graphqlClient from "../interceptor";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoader } from "../../redux/reducers/GlobalReducer";
import { RootState } from "../../redux/store";

export type sortKeyType =
  | "MANUAL"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "TITLE_ASC"
  | "TITLE_DESC"
  | "BEST_SELLING"
  | "CREATED_AT_ASC"
  | "CREATED_AT_DESC";

const useGetProducts = (
  handle: string | null,
  count: number,
  search: string | null = null,
  sortKey: sortKeyType = "MANUAL"
) => {
  const { language = "EN" } = useSelector(
    (state: RootState) => state.AuthReducer
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const getProducts = async () => {
      dispatch(toggleLoader(true));
      try {
        // Map sortKey to Shopify API accepted sortKey + reverse
        let apiSortKey: string;
        let reverse = false;

        switch (sortKey) {
          case "PRICE_ASC":
            apiSortKey = "PRICE";
            reverse = false;
            break;
          case "PRICE_DESC":
            apiSortKey = "PRICE";
            reverse = true;
            break;
          case "TITLE_ASC":
            apiSortKey = "TITLE";
            reverse = false;
            break;
          case "TITLE_DESC":
            apiSortKey = "TITLE";
            reverse = true;
            break;
          case "CREATED_AT_ASC":
            apiSortKey = "CREATED";
            reverse = false;
            break;
          case "CREATED_AT_DESC": // latest product first
            apiSortKey = "CREATED";
            reverse = true;
            break;
          case "BEST_SELLING":
            apiSortKey = "BEST_SELLING";
            reverse = false;
            break;
          case "MANUAL":
          default:
            apiSortKey = "MANUAL";
            reverse = false;
            break;
        }

        const response = await graphqlClient.post("", {
          query: `
            query GetProductsInCollection(
              $handle: String!,
              $count: Int!,
              $sortKey: ProductCollectionSortKeys!,
              $reverse: Boolean!
            ) @inContext(language: ${language.toUpperCase()}) {
              collection(handle: $handle) {
                id
                title
                products(first: $count, sortKey: $sortKey, reverse: $reverse) {
                  edges {
                    node {
                      id
                      title
                      handle
                      vendor
                      availableForSale
                      tags
                      images(first: 1) {
                        edges {
                          node {
                            id
                            url
                            width
                            height
                            altText
                          }
                        }
                      }
                      priceRange {
                        minVariantPrice {
                          amount
                          currencyCode
                        }
                        maxVariantPrice {
                          amount
                          currencyCode
                        }
                      }
                      variants(first: 1) {
                        edges {
                          node {
                            compareAtPrice {
                              amount
                              currencyCode
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            handle,
            count,
            sortKey: apiSortKey,
            reverse,
          },
        });

        const productsData =
          response.data?.collection?.products?.edges || [];

        setProducts(productsData);
        setLoading(false);
        dispatch(toggleLoader(false));
      } catch (error: any) {
        setError(error);
        setLoading(false);
        dispatch(toggleLoader(false));
      }
    };

    if (handle) {
      getProducts();
    }
  }, [handle, count, language, sortKey, dispatch]);

  return { products, loading, error };
};

export default useGetProducts;
