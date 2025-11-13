/* eslint-disable no-catch-shadow */
import { useState } from "react";
import graphqlClient from "../interceptor";
import { useDispatch } from "react-redux";
import { toggleLoader } from "../../redux/reducers/GlobalReducer";

/**
 * Fetch a product and its details by Variant GID.
 * Example variantId: gid://shopify/ProductVariant/51994489782561
 */
const useGetProductByVariant = () => {
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  const getProductByVariant = async (variantId: string) => {
    if (!variantId) return;
    setLoading(true);
    dispatch(toggleLoader(true));

    try {
      const response = await graphqlClient.post("", {
        query: `
          query GetVariantWithProduct($id: ID!) {
            node(id: $id) {
              ... on ProductVariant {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                  width
                  height
                }
                product {
                  id
                  title
                  handle
                  description
                  vendor
                  tags
                  images(first: 5) {
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
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price {
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
        `,
        variables: { id: variantId },
      });

      const variantNode = response?.data?.node;
      if (!variantNode) throw new Error("Variant not found");

      // Variant includes its parent product
      setProductDetails(variantNode);
    } catch (error: any) {
      console.error("GetProductByVariant error:", error);
      setError(error);
    } finally {
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return { productDetails, getProductByVariant, loading, error };
};

export default useGetProductByVariant;
