// /* eslint-disable no-catch-shadow */
// // useGetBestSelling.js
// import { useEffect, useState } from "react";
// import graphqlClient from "../interceptor";
// import { useDispatch } from "react-redux";
// import { updateCount } from "../../redux/reducers/CartReducer";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { toggleLoader } from "../../redux/reducers/GlobalReducer";

// const useUpdateQuantity = () => {
//   const [updateQuantityData, setUpdateQuantityData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const dispatch = useDispatch();

//   const updateQuantity = async (lineItemId: any, quantity: any) => {
//     dispatch(toggleLoader(true));
//     try {
//       const value = await AsyncStorage.getItem("checkoutId");
//       if (value !== null) {
//         const response = await graphqlClient.post("", {
//           query: `mutation {
//             cartLinesUpdate(
//               cartId: "${value}"
//               lines: [
//                 {
//                   id: "${lineItemId}"
//                   quantity: ${quantity}
//                 }
//               ]
//             ) {
//               cart {
//                 id
//                 lines(first: 10) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise {
//                         ... on ProductVariant {
//                           title
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//               userErrors {
//                 message
//               }
//             }
//           }`
//         });
        

//         const { data } = response;
//         console.log(response,'this is response');
        
//         setUpdateQuantityData(data);
//         setLoading(false);
//         dispatch(toggleLoader(false));
//       }
//     } catch (e) {
//       setError(error);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return { updateQuantityData, updateQuantity };
// };

// export default useUpdateQuantity;



/* eslint-disable no-catch-shadow */
import { useEffect, useState } from "react";
import graphqlClient from "../interceptor";
import { useDispatch } from "react-redux";
import { updateCount } from "../../redux/reducers/CartReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toggleLoader } from "../../redux/reducers/GlobalReducer";

// ====== CONFIGURATION ======
const FREE_GIFT_VARIANT_ID = "gid://shopify/ProductVariant/51955052773665"; // Replace with your actual gift variant ID
const FREE_GIFT_THRESHOLD = 30; // 30 QAR
const DISCOUNT_CODE = "100offnazeeb"; // Your Shopify discount code

// ====== TYPES ======
interface CartLine {
  node: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
    };
    cost?: {
      totalAmount: {
        amount: string;
      };
    };
  };
}

interface Cart {
  id: string;
  cost: {
    subtotalAmount: {
      amount: string;
    };
  };
  lines: {
    edges: CartLine[];
  };
  discountCodes?: {
    code: string;
    applicable: boolean;
  }[];
}

interface CartResponse {
  data?: {
    cart?: Cart;
    cartLinesUpdate?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
    cartDiscountCodesUpdate?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
  };
}

const useUpdateQuantity = () => {
  const [updateQuantityData, setUpdateQuantityData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  /**
   * Apply discount code to cart
   */
  const applyDiscountCode = async (
    cartId: string,
    discountCode: string
  ): Promise<Cart | null> => {
    try {
      const response: CartResponse = await graphqlClient.post("", {
        query: `
          mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
            cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
              cart {
                id
                discountCodes {
                  code
                  applicable
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          cartId,
          discountCodes: [discountCode],
        },
      });

      console.log("✅ Discount code applied:", discountCode);
      return response.data?.cartDiscountCodesUpdate?.cart || null;
    } catch (err) {
      console.error("Error applying discount:", err);
      return null;
    }
  };

  /**
   * Remove all discount codes from cart
   */
  const removeDiscountCode = async (cartId: string): Promise<Cart | null> => {
    try {
      const response: CartResponse = await graphqlClient.post("", {
        query: `
          mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
            cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
              cart {
                id
                discountCodes {
                  code
                  applicable
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          cartId,
          discountCodes: [],
        },
      });

      console.log("🗑️ Discount code removed");
      return response.data?.cartDiscountCodesUpdate?.cart || null;
    } catch (err) {
      console.error("Error removing discount:", err);
      return null;
    }
  };

  /**
   * Calculate subtotal excluding free gift product
   */
  const calculateSubtotalWithoutGift = (cart: Cart): number => {
    const lineItems = cart.lines.edges.map((edge) => edge.node);

    let subtotalWithoutGift = 0;

    lineItems.forEach((item) => {
      // Skip the free gift in calculation
      if (item.merchandise.id === FREE_GIFT_VARIANT_ID) {
        return;
      }

      // Add line cost to subtotal
      if (item.cost?.totalAmount?.amount) {
        subtotalWithoutGift += parseFloat(item.cost.totalAmount.amount);
      }
    });

    console.log("📊 Subtotal (excluding gift):", subtotalWithoutGift);
    return subtotalWithoutGift;
  };

  /**
   * Check and manage free gift based on cart subtotal (excluding gift itself)
   */
  const manageFreeGift = async (
    cartId: string,
    cart: Cart
  ): Promise<void> => {
    // Calculate subtotal WITHOUT the gift product
    const subtotal = calculateSubtotalWithoutGift(cart);

    const lineItems = cart.lines.edges.map((edge) => edge.node);
    const giftLine = lineItems.find(
      (item) => item.merchandise.id === FREE_GIFT_VARIANT_ID
    );
    const hasGift = !!giftLine;
    const hasDiscountCode = cart.discountCodes?.some(
      (dc) => dc.code === DISCOUNT_CODE
    );

    console.log("🎁 Gift Management (Update):", {
      subtotal,
      threshold: FREE_GIFT_THRESHOLD,
      hasGift,
      hasDiscountCode,
      shouldHaveGift: subtotal >= FREE_GIFT_THRESHOLD,
    });

    // Add gift and discount if threshold is met
    if (subtotal >= FREE_GIFT_THRESHOLD && !hasGift) {
      try {
        // Add gift product
        await graphqlClient.post("", {
          query: `
            mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            cartId,
            lines: [{ merchandiseId: FREE_GIFT_VARIANT_ID, quantity: 1 }],
          },
        });

        // Apply discount code after adding gift
        if (!hasDiscountCode) {
          await applyDiscountCode(cartId, DISCOUNT_CODE);
        }

        console.log("✅ Free gift added with discount!");
      } catch (err) {
        console.error("Error adding free gift:", err);
      }
    }
    // Remove gift and discount if below threshold
    else if (subtotal < FREE_GIFT_THRESHOLD && hasGift) {
      try {
        // Remove gift product
        await graphqlClient.post("", {
          query: `
            mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
              cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            cartId,
            lineIds: [giftLine.id],
          },
        });

        // Remove discount code
        if (hasDiscountCode) {
          await removeDiscountCode(cartId);
        }

        console.log("🗑️ Free gift and discount removed");
      } catch (err) {
        console.error("Error removing free gift:", err);
      }
    }
    // Ensure discount is applied if gift exists
    else if (subtotal >= FREE_GIFT_THRESHOLD && hasGift && !hasDiscountCode) {
      await applyDiscountCode(cartId, DISCOUNT_CODE);
      console.log("✅ Discount re-applied");
    }
  };

  /**
   * Update cart item quantity and manage free gift
   */
  const updateQuantity = async (lineItemId: string, quantity: number) => {
    dispatch(toggleLoader(true));
    setLoading(true);

    try {
      const value = await AsyncStorage.getItem("checkoutId");
      if (value !== null) {
        // Update quantity
        const response: CartResponse = await graphqlClient.post("", {
          query: `
            mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart {
                  id
                  cost {
                    subtotalAmount {
                      amount
                    }
                  }
                  lines(first: 100) {
                    edges {
                      node {
                        id
                        quantity
                        merchandise {
                          ... on ProductVariant {
                            id
                            title
                          }
                        }
                        cost {
                          totalAmount {
                            amount
                          }
                        }
                      }
                    }
                  }
                  discountCodes {
                    code
                    applicable
                  }
                }
                userErrors {
                  message
                  field
                }
              }
            }
          `,
          variables: {
            cartId: value,
            lines: [
              {
                id: lineItemId,
                quantity: quantity,
              },
            ],
          },
        });

        const cart = response.data?.cartLinesUpdate?.cart;
        const userErrors = response.data?.cartLinesUpdate?.userErrors;

        if (userErrors && userErrors.length > 0) {
          console.error("User Errors:", userErrors);
          throw new Error(userErrors[0].message);
        }

        if (!cart) {
          throw new Error("Cart update failed");
        }

        console.log("📦 Quantity updated:", { lineItemId, quantity });

        // Manage free gift based on updated cart total
        await manageFreeGift(value, cart);

        // Fetch updated cart after gift management
        const updatedResponse: CartResponse = await graphqlClient.post("", {
          query: `
            query getCart($cartId: ID!) {
              cart(id: $cartId) {
                id
                cost {
                  subtotalAmount {
                    amount
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                        }
                      }
                      cost {
                        totalAmount {
                          amount
                        }
                      }
                    }
                  }
                }
                discountCodes {
                  code
                  applicable
                }
              }
            }
          `,
          variables: { cartId: value },
        });

        const finalCart = updatedResponse.data?.cart || cart;
        setUpdateQuantityData({
          data: { cartLinesUpdate: { cart: finalCart } },
        });
        setLoading(false);
        dispatch(toggleLoader(false));
      }
    } catch (e: any) {
      console.error("Error in updateQuantity:", e);
      setError(e);
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return { updateQuantityData, updateQuantity, loading, error };
};

export default useUpdateQuantity;
