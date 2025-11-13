

// /* eslint-disable no-catch-shadow */
// import { useState } from 'react';
// import graphqlClient from '../interceptor';
// import { useDispatch } from 'react-redux';
// import { toggleLoader } from '../../redux/reducers/GlobalReducer';
// import { GiftDetails } from './useUpdateQuantity';

// // ====== CONFIGURATION ======
// const FREE_GIFT_VARIANT_ID = "gid://shopify/ProductVariant/51955052773665";
// const FREE_GIFT_THRESHOLD = 49; // 30 QAR
// const DISCOUNT_CODE = "100offnazeeb"; // Fixed 20 QAR discount (makes 1 gift free)

// // ====== TYPES ======
// interface CartLineNode {
//   id: string;
//   quantity: number;
//   merchandise: { id: string; title: string; product?: { title: string } };
//   cost?: { totalAmount: { amount: string } };
// }

// interface Cart {
//   id: string;
//   cost: { subtotalAmount: { amount: string } };
//   lines: { edges: { node: CartLineNode }[] };
//   discountCodes?: { code: string; applicable: boolean }[];
// }

// interface CartResponse {
//   data?: {
//     cart?: Cart;
//     cartLinesRemove?: { cart: Cart; userErrors: { field: string; message: string }[] };
//     cartDiscountCodesUpdate?: { cart: Cart; userErrors: { field: string; message: string }[] };
//   };
// }

// const useRemoveFromCart = () => {
//   const [removeCartData, setRemoveCartData] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const dispatch = useDispatch();

//   /* ------------------------------------------------------------------ */
//   /*  Apply / Remove Discount (Single reusable function)                */
//   /* ------------------------------------------------------------------ */
//   const updateDiscountCode = async (cartId: string, apply: boolean): Promise<Cart | null> => {
//     try {
//       const resp: CartResponse = await graphqlClient.post('', {
//         query: `
//           mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
//             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
//               cart { id discountCodes { code applicable } }
//               userErrors { field message }
//             }
//           }
//         `,
//         variables: { cartId, discountCodes: apply ? [DISCOUNT_CODE] : [] },
//       });
//       console.log(apply ? 'Discount applied' : 'Discount removed');
//       return resp.data?.cartDiscountCodesUpdate?.cart || null;
//     } catch (e) {
//       console.error(`updateDiscountCode error (${apply ? 'apply' : 'remove'}):`, e);
//       return null;
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /*  Manage Free Gift (Optimized: No extra fetch, uses current cart)   */
//   /* ------------------------------------------------------------------ */
//   const manageFreeGift = async (cartId: string, cart: Cart): Promise<Cart | null> => {
//     const lines = cart.lines.edges.map(e => e.node);
//     const giftLine = lines.find(l => l.merchandise.id === FREE_GIFT_VARIANT_ID);
//     const hasDiscount = cart.discountCodes?.some(d => d.code === DISCOUNT_CODE);
//     const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
//     const giftQty = giftLine?.quantity || 0;

//     console.log('Cart subtotal:', subtotal, '| Gift qty:', giftQty, '| Has discount:', hasDiscount);

//     let updatedCart = cart;

//     // Helper: Update gift quantity
//     const updateGiftQty = async (newQty: number) => {
//       if (newQty <= 0) {
//         await graphqlClient.post('', {
//           query: `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
//             cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } }
//           }`,
//           variables: { cartId, lineIds: [giftLine!.id] },
//         });
//         console.log('Free gift removed completely');
//       } else {
//         await graphqlClient.post('', {
//           query: `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
//             cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } }
//           }`,
//           variables: { cartId, lines: [{ id: giftLine!.id, quantity: newQty }] },
//         });
//         console.log(`Gift quantity updated to ${newQty}`);
//       }
//     };

//     // CASE 1: Qualifies for free gift
//     if (subtotal >= FREE_GIFT_THRESHOLD) {
//       if (!giftLine) {
//         // Add new gift
//         await graphqlClient.post('', {
//           query: `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
//             cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id } }
//           }`,
//           variables: { cartId, lines: [{ merchandiseId: FREE_GIFT_VARIANT_ID, quantity: 1 }] },
//         });
//         console.log('Free gift added');
//       } else if (giftQty >= 1) {
//         // Increment gift
//         await updateGiftQty(giftQty + 1);
//       }

//       if (!hasDiscount) {
//         updatedCart = (await updateDiscountCode(cartId, true)) || updatedCart;
//       }
//     }
//     // CASE 2: Below threshold
//     else if (subtotal < FREE_GIFT_THRESHOLD && giftLine && hasDiscount) {
//       const newQty = Math.max(0, giftQty - 1);
//       await updateGiftQty(newQty);
//       updatedCart = (await updateDiscountCode(cartId, false)) || updatedCart;
//     }

//     return updatedCart;
//   };

//   /* ------------------------------------------------------------------ */
//   /*  Main: Remove Item + Handle Gift (Single Query + Conditional Flow) */
//   /* ------------------------------------------------------------------ */
//   const removeFromCart = async (checkoutId: string, lineItemId: string,giftDetails:GiftDetails) => {
//     dispatch(toggleLoader(true));
//     setLoading(true);

//     try {
//       // 1. Fetch cart ONCE to inspect removal target
//       const preRemoveResp: CartResponse = await graphqlClient.post('', {
//         query: `
//           query getCart($cartId: ID!) {
//             cart(id: $cartId) {
//               id
//               cost { subtotalAmount { amount } }
//               lines(first: 100) {
//                 edges {
//                   node {
//                     id
//                     quantity
//                     merchandise { ... on ProductVariant { id } }
//                   }
//                 }
//               }
//               discountCodes { code applicable }
//             }
//           }
//         `,
//         variables: { cartId: checkoutId },
//       });

//       const preCart = preRemoveResp.data?.cart;
//       if (!preCart) throw new Error('Cart not found');

//       const lineToRemove = preCart.lines.edges.find(e => e.node.id === lineItemId)?.node;
//       const isRemovingGift = lineToRemove?.merchandise.id === FREE_GIFT_VARIANT_ID;
//       const hasDiscount = preCart.discountCodes?.some(d => d.code === DISCOUNT_CODE);

//       // 2. If removing gift manually → remove discount first
//       if (isRemovingGift && hasDiscount) {
//         await updateDiscountCode(checkoutId, false);
//       }

//       // 3. Remove the line item (includes full cart in response)
//       const removeResp: CartResponse = await graphqlClient.post('', {
//         query: `
//           mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
//             cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
//               cart {
//                 id
//                 cost { subtotalAmount { amount } }
//                 lines(first: 100) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise {
//                         ... on ProductVariant { id title product { title } }
//                       }
//                       cost { totalAmount { amount } }
//                     }
//                   }
//                 }
//                 discountCodes { code applicable }
//               }
//               userErrors { message field }
//             }
//           }
//         `,
//         variables: { cartId: checkoutId, lineIds: [lineItemId] },
//       });

//       const removedCart = removeResp.data?.cartLinesRemove?.cart;
//       const errors = removeResp.data?.cartLinesRemove?.userErrors;

//       if (errors?.length) throw new Error(errors[0].message);
//       if (!removedCart) throw new Error('Cart removal failed');

//       console.log('Item removed from cart');

//       // 4. Only manage gift if NOT removing the gift itself
//       let finalCart = removedCart;
//       if (!isRemovingGift) {
//         finalCart = (await manageFreeGift(checkoutId, removedCart)) || removedCart;
//       }

//       // 5. Final fetch only if needed (avoid if manageFreeGift returned cart)
//       if (!finalCart.lines) {
//         const finalResp: CartResponse = await graphqlClient.post('', {
//           query: `
//             query getCart($cartId: ID!) {
//               cart(id: $cartId) {
//                 id
//                 cost { subtotalAmount { amount } }
//                 lines(first: 100) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise { ... on ProductVariant { id title product { title } } }
//                       cost { totalAmount { amount } }
//                     }
//                   }
//                 }
//                 discountCodes { code applicable }
//               }
//             }
//           `,
//           variables: { cartId: checkoutId },
//         });
//         finalCart = finalResp.data?.cart || finalCart;
//       }

//       setRemoveCartData({ data: { cartLinesRemove: { cart: finalCart } } });
//     } catch (err: any) {
//       console.error('Error in removeFromCart:', err);
//       setError(err);
//     } finally {
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return { removeCartData, removeFromCart, loading, error };
// };

// export default useRemoveFromCart;

/* eslint-disable no-catch-shadow */
/* eslint-disable no-catch-shadow */
import { useState } from 'react';
import graphqlClient from '../interceptor';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLoader } from '../../redux/reducers/GlobalReducer';
import { RootState } from '../../redux/store';

/* =========================
   TYPES
========================= */
interface CartLineNode {
  id: string;
  quantity: number;
  merchandise: { id: string; title: string; product?: { title: string } };
  cost?: { totalAmount: { amount: string } };
  attributes?: { key: string; value: string }[]; // tagging support
}
interface Cart {
  id: string;
  cost: { subtotalAmount: { amount: string } };
  lines: { edges: { node: CartLineNode }[] };
  discountCodes?: { code: string; applicable: boolean }[];
}
interface CartResponse {
  data?: {
    cart?: Cart;
    cartLinesRemove?: { cart: Cart; userErrors: { field: string; message: string }[] };
    cartDiscountCodesUpdate?: { cart: Cart; userErrors: { field: string; message: string }[] };
  };
}
type GiftDetails = {
  discountCode?: string;        // OPTIONAL → only used if BXGY is code-based
  gift: boolean;
  giftThreshold: number;
  productId: string;            // gift variant GID
};

/* =========================
   HOOK
========================= */
const useRemoveFromCart = () => {
  const [removeCartData, setRemoveCartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  // From Redux (e.g., state.globalReducer.details)
  const giftDetails = useSelector<RootState, GiftDetails | null>(
    (state) => (state as RootState).globalReducer?.details ?? null
  );

  /* ---------------------------------------------
   * Utilities
   * ------------------------------------------- */
  const getActiveCodes = (cart?: Cart) =>
    (cart?.discountCodes ?? []).map(d => d.code).filter(Boolean);

  const isTaggedGift = (l: CartLineNode) =>
    (l.attributes ?? []).some(a => a.key === '_free_gift' && a.value === '1');

  // Exclude ONLY the tagged gift line; manual (untagged) same-variant lines are counted
  const subtotalExcludingTaggedGift = (cart: Cart) => {
    const sum = cart.lines.edges.reduce((acc, { node }) => {
      if (isTaggedGift(node)) return acc;
      const amt = parseFloat(node.cost?.totalAmount?.amount ?? '0');
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
    return sum;
  };

  const setDiscountCodes = async (cartId: string, codes: string[]) => {
    const resp: CartResponse = await graphqlClient.post('', {
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

  const ensureDiscountPresent = async (cartId: string, cart: Cart, code?: string) => {
    if (!code) return; // Automatic BXGY: do nothing
    const codes = getActiveCodes(cart);
    if (!codes.includes(code)) {
      await setDiscountCodes(cartId, [...codes, code]);
      console.log('✅ BXGY code applied:', code);
    }
  };

  const ensureDiscountRemoved = async (cartId: string, cart: Cart, code?: string) => {
    if (!code) return; // Automatic BXGY: do nothing
    const codes = getActiveCodes(cart);
    if (codes.includes(code)) {
      await setDiscountCodes(cartId, codes.filter(c => c !== code));
      console.log('🗑️ BXGY code removed:', code);
    }
  };

  /* ---------------------------------------------
   * Gift management (no extra fetch)
   * ------------------------------------------- */
  const manageFreeGift = async (
    cartId: string,
    cart: Cart,
    details: GiftDetails,
    opts?: { avoidReAdd?: boolean }
  ): Promise<Cart | null> => {
    const { productId: GIFT_ID, giftThreshold: THRESHOLD, discountCode: CODE } = details;

    const lines = cart.lines.edges.map(e => e.node);

    // Find all tagged gift lines (manual purchases are untagged and remain paid)
    const taggedGiftLines = lines.filter(l => l.merchandise.id === GIFT_ID && isTaggedGift(l));
    const tagged = taggedGiftLines[0] ?? null;

    // Clean duplicates beyond the first, if any
    if (taggedGiftLines.length > 1) {
      const extras = taggedGiftLines.slice(1).map(l => l.id);
      await graphqlClient.post('', {
        query: `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart { id } userErrors { field message }
            }
          }
        `,
        variables: { cartId, lineIds: extras },
      });
      console.log('🧹 Removed duplicate tagged gift lines');
    }

    const qualifies = subtotalExcludingTaggedGift(cart) >= THRESHOLD;

    if (qualifies) {
      if (!tagged && opts?.avoidReAdd) {
        // User just manually removed the tagged gift; don’t re-add immediately
        await ensureDiscountRemoved(cartId, cart, CODE);
        return cart;
      }

      // Ensure we keep exactly 1 tagged gift with qty=1
      if (!tagged) {
        await graphqlClient.post('', {
          query: `
            mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart { id } userErrors { field message }
              }
            }
          `,
          variables: {
            cartId,
            lines: [{
              merchandiseId: GIFT_ID,
              quantity: 1,
              attributes: [{ key: '_free_gift', value: '1' }],
            }],
          },
        });
        console.log('🎁 Tagged free gift added');
      } else if (tagged.quantity !== 1) {
        await graphqlClient.post('', {
          query: `
            mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart { id } userErrors { field message }
              }
            }
          `,
          variables: { cartId, lines: [{ id: tagged.id, quantity: 1 }] },
        });
        console.log('🔧 Tagged gift quantity normalized to 1');
      }

      // Only apply a code if your BXGY is code-based
      await ensureDiscountPresent(cartId, cart, CODE);
      return cart;
    }

    // Below threshold → remove tagged gift (leave manual same-variant lines), remove code if present
    if (tagged) {
      await graphqlClient.post('', {
        query: `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart { id } userErrors { field message }
            }
          }
        `,
        variables: { cartId, lineIds: [tagged.id] },
      });
      console.log('🗑️ Tagged free gift removed');
    }

    await ensureDiscountRemoved(cartId, cart, CODE);
    return cart;
  };

  /* ---------------------------------------------
   * Main: remove item + handle gift (Redux-powered)
   * ------------------------------------------- */
  const removeFromCart = async (
    checkoutId: string,
    lineItemId: string
  ) => {
    dispatch(toggleLoader(true));
    setLoading(true);
    setError(null);

    try {
      if (!giftDetails?.productId) {
        console.warn('Gift details not ready in Redux; continuing without gift safeguards.');
      }

      // 1) Fetch current cart (to know if we’re deleting the TAGGED gift)
      const preRemoveResp: CartResponse = await graphqlClient.post('', {
        query: `
          query getCart($cartId: ID!) {
            cart(id: $cartId) {
              id
              cost { subtotalAmount { amount } }
              lines(first: 100) {
                edges {
                  node {
                    id
                    quantity
                    attributes { key value }           # keep attributes
                    merchandise { ... on ProductVariant { id } }
                    cost { totalAmount { amount } }
                  }
                }
              }
              discountCodes { code applicable }
            }
          }
        `,
        variables: { cartId: checkoutId },
      });

      const preCart = preRemoveResp.data?.cart;
      if (!preCart) throw new Error('Cart not found');

      const removingNode = preCart.lines.edges.find(e => e.node.id === lineItemId)?.node;
      const isRemovingTaggedGift = removingNode ? isTaggedGift(removingNode) : false;
      const activeCodes = getActiveCodes(preCart);

      // 2) If manually removing the TAGGED gift, remove ONLY our BXGY code first (if code-based)
      if (isRemovingTaggedGift && giftDetails?.discountCode && activeCodes.includes(giftDetails.discountCode)) {
        const next = activeCodes.filter(c => c !== giftDetails.discountCode);
        await setDiscountCodes(checkoutId, next);
        console.log('➡️ Removed BXGY code before deleting tagged gift line');
      }

      // 3) Remove the target line
      const removeResp: CartResponse = await graphqlClient.post('', {
        query: `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart {
                id
                cost { subtotalAmount { amount } }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      attributes { key value }         # keep attributes
                      merchandise { ... on ProductVariant { id title product { title } } }
                      cost { totalAmount { amount } }
                    }
                  }
                }
                discountCodes { code applicable }
              }
              userErrors { message field }
            }
          }
        `,
        variables: { cartId: checkoutId, lineIds: [lineItemId] },
      });

      const removedCart = removeResp.data?.cartLinesRemove?.cart;
      const errors = removeResp.data?.cartLinesRemove?.userErrors;
      if (errors?.length) throw new Error(errors[0].message);
      if (!removedCart) throw new Error('Cart removal failed');

      console.log('🧹 Item removed');

      // 4) Reconcile gift/discount:
      //    - If user removed the tagged gift, avoid immediate re-add.
      //    - Otherwise, manage normally (cap 1 tagged gift; manual purchases stay paid).
      const finalCart = giftDetails?.productId
        ? (await manageFreeGift(
            checkoutId,
            removedCart,
            giftDetails,
            { avoidReAdd: isRemovingTaggedGift }
          )) || removedCart
        : removedCart;

      setRemoveCartData({ data: { cartLinesRemove: { cart: finalCart } } });
    } catch (err: any) {
      console.error('Error in removeFromCart:', err);
      setError(err);
    } finally {
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return { removeCartData, removeFromCart, loading, error };
};

export default useRemoveFromCart;
