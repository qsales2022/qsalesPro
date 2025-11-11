
// import { useEffect, useState } from "react";
// import graphqlClient from "../interceptor";
// import { useDispatch } from "react-redux";
// import { updateCount } from "../../redux/reducers/CartReducer";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { toggleLoader } from "../../redux/reducers/GlobalReducer";

// // ====== CONFIGURATION ======
// const FREE_GIFT_VARIANT_ID = "gid://shopify/ProductVariant/51955052773665"; // Replace with your actual gift variant ID
// const FREE_GIFT_THRESHOLD = 30; // 30 QAR
// const DISCOUNT_CODE = "100offnazeeb"; // Your Shopify discount code

// // ====== TYPES ======
// interface CartLine {
//   node: {
//     id: string;
//     quantity: number;
//     merchandise: {
//       id: string;
//       title: string;
//     };
//     cost?: {
//       totalAmount: {
//         amount: string;
//       };
//     };
//   };
// }

// interface Cart {
//   id: string;
//   cost: {
//     subtotalAmount: {
//       amount: string;
//     };
//   };
//   lines: {
//     edges: CartLine[];
//   };
//   discountCodes?: {
//     code: string;
//     applicable: boolean;
//   }[];
// }

// interface CartResponse {
//   data?: {
//     cart?: Cart;
//     cartLinesUpdate?: {
//       cart: Cart;
//       userErrors: { field: string; message: string }[];
//     };
//     cartDiscountCodesUpdate?: {
//       cart: Cart;
//       userErrors: { field: string; message: string }[];
//     };
//   };
// }

// const useUpdateQuantity = () => {
//   const [updateQuantityData, setUpdateQuantityData] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const dispatch = useDispatch();

//   /**
//    * Apply discount code to cart
//    */
//   const applyDiscountCode = async (
//     cartId: string,
//     discountCode: string
//   ): Promise<Cart | null> => {
//     try {
//       const response: CartResponse = await graphqlClient.post("", {
//         query: `
//           mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
//             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
//               cart {
//                 id
//                 discountCodes {
//                   code
//                   applicable
//                 }
//               }
//               userErrors {
//                 field
//                 message
//               }
//             }
//           }
//         `,
//         variables: {
//           cartId,
//           discountCodes: [discountCode],
//         },
//       });

//       console.log("✅ Discount code applied:", discountCode);
//       return response.data?.cartDiscountCodesUpdate?.cart || null;
//     } catch (err) {
//       console.error("Error applying discount:", err);
//       return null;
//     }
//   };

//   /**
//    * Remove all discount codes from cart
//    */
//   const removeDiscountCode = async (cartId: string): Promise<Cart | null> => {
//     try {
//       const response: CartResponse = await graphqlClient.post("", {
//         query: `
//           mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
//             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
//               cart {
//                 id
//                 discountCodes {
//                   code
//                   applicable
//                 }
//               }
//               userErrors {
//                 field
//                 message
//               }
//             }
//           }
//         `,
//         variables: {
//           cartId,
//           discountCodes: [],
//         },
//       });

//       console.log("🗑️ Discount code removed");
//       return response.data?.cartDiscountCodesUpdate?.cart || null;
//     } catch (err) {
//       console.error("Error removing discount:", err);
//       return null;
//     }
//   };

//   /**
//    * Calculate subtotal excluding free gift product
//    */
//   const calculateSubtotalWithoutGift = (cart: Cart): number => {
//     const lineItems = cart.lines.edges.map((edge) => edge.node);

//     let subtotalWithoutGift = 0;

//     lineItems.forEach((item) => {
//       // Skip the free gift in calculation
//       // Add line cost to subtotal
//       if (item.cost?.totalAmount?.amount) {
//         subtotalWithoutGift += parseFloat(item.cost.totalAmount.amount);
//       }
//     });

//     console.log("📊 Subtotal (excluding gift):", subtotalWithoutGift);
//     return subtotalWithoutGift;
//   };

//   /**
//    * Check and manage free gift based on cart subtotal (excluding gift itself)
//    */
//   const manageFreeGift = async (
//     cartId: string,
//     cart: Cart
//   ): Promise<void> => {
//     // Calculate subtotal WITHOUT the gift product
//     const subtotal = calculateSubtotalWithoutGift(cart);

//     const lineItems = cart.lines.edges.map((edge) => edge.node);
//     const giftLine = lineItems.find(
//       (item) => item.merchandise.id === FREE_GIFT_VARIANT_ID
//     );
//     const hasGift = !!giftLine;
//     const hasDiscountCode = cart.discountCodes?.some(
//       (dc) => dc.code === DISCOUNT_CODE
//     );
//     console.log(subtotal, giftLine, 'subtotal');

//     // Add gift and discount if threshold is met
//     if (subtotal >= FREE_GIFT_THRESHOLD && !hasGift) {
//       try {
//         // Add gift product
//         await graphqlClient.post("", {
//           query: `
//             mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
//               cartLinesAdd(cartId: $cartId, lines: $lines) {
//                 cart {
//                   id
//                 }
//                 userErrors {
//                   field
//                   message
//                 }
//               }
//             }
//           `,
//           variables: {
//             cartId,
//             lines: [{ merchandiseId: FREE_GIFT_VARIANT_ID, quantity: 1 }],
//           },
//         });

//         // Apply discount code after adding gift
//         if (!hasDiscountCode) {
//           await applyDiscountCode(cartId, DISCOUNT_CODE);
//         }

//         console.log("✅ Free gift added with discount!");
//       } catch (err) {
//         console.error("Error adding free gift:", err);
//       }
//     }
//     // Remove gift and discount if below threshold
//     else if (subtotal < FREE_GIFT_THRESHOLD && hasGift) {

//       try {
//         if (lineItems?.length > 1 && giftLine?.quantity > 1) {
//           await graphqlClient.post("", {
//             query: `
//             mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
//               cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
//                 cart {
//                   id
//                 }
//                 userErrors {
//                   field
//                   message
//                 }
//               }
//             }
//           `,
//             variables: {
//               cartId,
//               lineIds: [giftLine.id],
//             },
//           });
//         }
//         // Remove gift product


//         // Remove discount code
//         if (hasDiscountCode) {
//           await removeDiscountCode(cartId);
//         }

//         console.log("🗑️ Free gift and discount removed");
//       } catch (err) {
//         console.error("Error removing free gift:", err);
//       }
//     }
//     // Ensure discount is applied if gift exists
//     else if (subtotal >= FREE_GIFT_THRESHOLD && hasGift && !hasDiscountCode) {
//       await applyDiscountCode(cartId, DISCOUNT_CODE);
//       console.log("✅ Discount re-applied");
//     }
//   };

//   /**
//    * Update cart item quantity and manage free gift
//    */
//   const updateQuantity = async (lineItemId: string, quantity: number) => {
//     dispatch(toggleLoader(true));
//     setLoading(true);
//     try {
//       const value = await AsyncStorage.getItem("checkoutId");
//       if (value !== null) {
//         // Update quantity
//         const response: CartResponse = await graphqlClient.post("", {
//           query: `
//             mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
//               cartLinesUpdate(cartId: $cartId, lines: $lines) {
//                 cart {
//                   id
//                   cost {
//                     subtotalAmount {
//                       amount
//                     }
//                   }
//                   lines(first: 100) {
//                     edges {
//                       node {
//                         id
//                         quantity
//                         merchandise {
//                           ... on ProductVariant {
//                             id
//                             title
//                           }
//                         }
//                         cost {
//                           totalAmount {
//                             amount
//                           }
//                         }
//                       }
//                     }
//                   }
//                   discountCodes {
//                     code
//                     applicable
//                   }
//                 }
//                 userErrors {
//                   message
//                   field
//                 }
//               }
//             }
//           `,
//           variables: {
//             cartId: value,
//             lines: [
//               {
//                 id: lineItemId,
//                 quantity: quantity,
//               },
//             ],
//           },
//         });

//         const cart = response.data?.cartLinesUpdate?.cart;
//         const userErrors = response.data?.cartLinesUpdate?.userErrors;

//         if (userErrors && userErrors.length > 0) {
//           console.error("User Errors:", userErrors);
//           throw new Error(userErrors[0].message);
//         }

//         if (!cart) {
//           throw new Error("Cart update failed");
//         }
//         // Manage free gift based on updated cart total
//         await manageFreeGift(value, cart);

//         // Fetch updated cart after gift management
//         const updatedResponse: CartResponse = await graphqlClient.post("", {
//           query: `
//             query getCart($cartId: ID!) {
//               cart(id: $cartId) {
//                 id
//                 cost {
//                   subtotalAmount {
//                     amount
//                   }
//                 }
//                 lines(first: 100) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise {
//                         ... on ProductVariant {
//                           id
//                           title
//                         }
//                       }
//                       cost {
//                         totalAmount {
//                           amount
//                         }
//                       }
//                     }
//                   }
//                 }
//                 discountCodes {
//                   code
//                   applicable
//                 }
//               }
//             }
//           `,
//           variables: { cartId: value },
//         });

//         const finalCart = updatedResponse.data?.cart || cart;
//         setUpdateQuantityData({
//           data: { cartLinesUpdate: { cart: finalCart } },
//         });
//         setLoading(false);
//         dispatch(toggleLoader(false));
//       }
//     } catch (e: any) {
//       console.error("Error in updateQuantity:", e);
//       setError(e);
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return { updateQuantityData, updateQuantity, loading, error };
// };

// export default useUpdateQuantity;


/* eslint-disable no-catch-shadow */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-catch-shadow */

/* eslint-disable no-catch-shadow */

/* eslint-disable no-catch-shadow */
// useUpdateQuantity.ts


import { useState } from "react";
import graphqlClient from "../interceptor";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toggleLoader } from "../../redux/reducers/GlobalReducer";
import { RootState } from "../../redux/store";


// giftUtils.ts

/* =========================
   Shared Types
========================= */
export interface CartLineNode {
  id: string;
  quantity: number;
  merchandise: { id: string; title: string };
  cost?: { totalAmount: { amount: string } };
  attributes?: { key: string; value: string }[];
}
export interface CartLineEdge { node: CartLineNode }

export interface Cart {
  id: string;
  cost: { subtotalAmount: { amount: string } };
  lines: { edges: CartLineEdge[] };
  discountCodes?: { code: string; applicable: boolean }[];
}

export type GiftDetails = {
  gift: boolean;           // enable/disable gift feature
  giftThreshold: number;   // threshold in store currency
  productId: string;       // VARIANT GID of the gift (gid://shopify/ProductVariant/xxx)
  discountCode?: string;   // optional BXGY code (leave undefined for Automatic)
};

export interface CartResponse {
  data?: {
    cart?: Cart;
    cartLinesAdd?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
    cartLinesRemove?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
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

/* =========================
   Helpers
========================= */
export const isTaggedGift = (line: CartLineNode) =>
  (line.attributes ?? []).some(a => a.key === "_free_gift" && a.value === "1");

/** Subtotal excluding ONLY the tagged gift line (manual/untagged lines remain paid). */
export const subtotalExcludingTaggedGift = (cart: Cart): number =>
  cart.lines.edges.reduce((sum, { node }) => {
    if (isTaggedGift(node)) return sum;
    const amt = parseFloat(node.cost?.totalAmount?.amount ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

const getActiveCodes = (cart?: Cart): string[] =>
  (cart?.discountCodes ?? []).map(d => d.code).filter(Boolean);

const setDiscountCodes = async (cartId: string, codes: string[]) => {
  const resp: CartResponse = await graphqlClient.post("", {
    query: `
      mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart { id discountCodes { code applicable } }
          userErrors { field message }
        }
      }
    `,
    variables: { cartId, discountCodes: codes },
  });

  const errs = resp.data?.cartDiscountCodesUpdate?.userErrors;
  if (errs?.length) throw new Error(errs[0].message);
  return resp.data?.cartDiscountCodesUpdate?.cart ?? null;
};

export const ensureDiscountPresent = async (cartId: string, cart: Cart, code?: string) => {
  if (!code) return; // Automatic discount: nothing to apply
  const codes = getActiveCodes(cart);
  if (!codes.includes(code)) await setDiscountCodes(cartId, [...codes, code]);
};

export const ensureDiscountRemoved = async (cartId: string, cart: Cart, code?: string) => {
  if (!code) return; // Automatic discount: nothing to remove
  const codes = getActiveCodes(cart);
  if (codes.includes(code)) await setDiscountCodes(cartId, codes.filter(c => c !== code));
};

/* =========================
   Canonical Gift Manager
========================= */
/**
 * Behavior:
 * - Tagged gift line: attributes [{ key: "_free_gift", value: "1" }], qty must be 1.
 * - When qualified (subtotal excluding tagged gift ≥ threshold):
 *     • Ensure exactly one tagged gift exists (add if missing; cap qty to 1).
 *     • Ensure discount code is present (if provided).
 * - When NOT qualified:
 *     • Remove only the tagged gift (leave untagged/paid same-variant lines untouched).
 *     • Ensure discount code removed (if provided).
 * - If multiple tagged gift lines exist, dedupe to 1 (keep first, remove rest).
 *
 * @param opts.avoidReAdd  If true and customer manually removed the tagged gift
 *                         during the same UI cycle, respect it and do not re-add.
 */
export const manageFreeGift = async (
  cartId: string,
  cart: Cart,
  details: GiftDetails,
  opts?: { avoidReAdd?: boolean }
): Promise<void> => {
  const { productId: GIFT_ID, giftThreshold: THRESHOLD, discountCode } = details;

  const lines = cart.lines.edges.map(e => e.node);
  console.log(lines);

  const taggedGiftLines = lines.filter(l => l.merchandise.id === GIFT_ID && isTaggedGift(l));

  const tagged = taggedGiftLines[0] ?? null;

  // Safety: dedupe multiple tagged gift lines
  if (taggedGiftLines.length > 1) {
    const extraIds = taggedGiftLines.slice(1).map(l => l.id);
    await graphqlClient.post("", {
      query: `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart { id }
            userErrors { field message }
          }
        }
      `,
      variables: { cartId, lineIds: extraIds },
    });
  }

  const qualifies = subtotalExcludingTaggedGift(cart) >= THRESHOLD;

  if (qualifies) {
    // respect UX flag to not re-add instantly if user just removed the gift in the same cycle
    if (!tagged && opts?.avoidReAdd) {
      await ensureDiscountRemoved(cartId, cart, discountCode);
      return;
    }

    // ensure presence with qty=1
    if (!tagged) {
      await graphqlClient.post("", {
        query: `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart { id }
              userErrors { field message }
            }
          }
        `,
        variables: {
          cartId,
          lines: [{
            merchandiseId: GIFT_ID,
            quantity: 1,
            attributes: [{ key: "_free_gift", value: "1" }],
          }],
        },
      });
    } else if (tagged.quantity !== 1) {
      await graphqlClient.post("", {
        query: `
          mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart { id }
              userErrors { field message }
            }
          }
        `,
        variables: { cartId, lines: [{ id: tagged.id, quantity: 1 }] },
      });
    }

    await ensureDiscountPresent(cartId, cart, discountCode);
    return;
  }

  // Not qualified → remove only the tagged gift (leave untagged/paid lines)
  if (tagged) {
    await graphqlClient.post("", {
      query: `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart { id }
            userErrors { field message }
          }
        }
      `,
      variables: { cartId, lineIds: [tagged.id] },
    });
  }
  await ensureDiscountRemoved(cartId, cart, discountCode);
};


const useUpdateQuantity = () => {
  const [updateQuantityData, setUpdateQuantityData] =
    useState<{ data: { cartLinesUpdate: { cart: Cart } } } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  const giftDetails = useSelector<RootState, GiftDetails | null>(
    (state) => (state as RootState).globalReducer?.details ?? null
  );

  const updateQuantity = async (lineItemId: string, quantity: number) => {
    dispatch(toggleLoader(true));
    setLoading(true);
    setError(null);

    try {
      const cartId = await AsyncStorage.getItem("checkoutId");
      if (!cartId) throw new Error("No checkoutId found");

      const resp: CartResponse = await graphqlClient.post("", {
        query: `
          mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart {
                id
                cost { subtotalAmount { amount } }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      attributes { key value }          # keep attributes to detect tagged gift
                      merchandise { ... on ProductVariant { id title } }
                      cost { totalAmount { amount } }
                    }
                  }
                }
                discountCodes { code applicable }
              }
              userErrors { field message }
            }
          }
        `,
        variables: { cartId, lines: [{ id: lineItemId, quantity }] },
      });

      const errs = resp.data?.cartLinesUpdate?.userErrors;
      if (errs?.length) throw new Error(errs[0].message);

      const cart = resp.data?.cartLinesUpdate?.cart;
      if (!cart) throw new Error("Cart update failed");

      if (giftDetails?.gift && giftDetails.productId) {
        // Same logic as add-to-cart for full compatibility
        await manageFreeGift(cartId, cart, giftDetails);
      }

      // Consistent shape for consumers of this hook
      setUpdateQuantityData({ data: { cartLinesUpdate: { cart } } });
    } catch (e: any) {
      console.error("Error in updateQuantity:", e);
      setError(e);
    } finally {
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return { updateQuantityData, updateQuantity, loading, error };
};

export default useUpdateQuantity;
