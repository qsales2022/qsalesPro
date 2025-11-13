



// /* eslint-disable no-catch-shadow */
// import { useState } from 'react';
// import graphqlClient from '../interceptor';
// import { useDispatch } from 'react-redux';
// import { toggleLoader } from '../../redux/reducers/GlobalReducer';
// import { GiftDetails } from './useUpdateQuantity';

// // ====== CONFIGURATION ======
// // const FREE_GIFT_VARIANT_ID = "gid://shopify/ProductVariant/51955052773665";
// // const FREE_GIFT_THRESHOLD = 49; // 30 QAR
// // const DISCOUNT_CODE = "100offnazeeb"; // Fixed 20 QAR discount (makes 1 gift free)

// // ====== TYPES ======
// interface CartLineNode {
//   id: string;
//   quantity: number;
//   merchandise: { id: string; title: string };
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
//     cartLinesAdd?: { cart: Cart; userErrors: { field: string; message: string }[] };
//     cartLinesRemove?: { cart: Cart; userErrors: { field: string; message: string }[] };
//     cartDiscountCodesUpdate?: { cart: Cart; userErrors: { field: string; message: string }[] };
//   };
// }
// interface LineItem {
//   merchandiseId: string;
//   quantity: number;
// }

// // ====== HOOK ======
// const useAddToCart = () => {
//   const [addCartData, setAddCartData] = useState<Cart | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const dispatch = useDispatch();

//   /* ------------------------------------------------------------------ */
//   /*  Apply / Remove the 100% discount code                            */
//   /* ------------------------------------------------------------------ */
//   const applyGiftDiscount = async (cartId: string): Promise<void> => {
//     try {
//       await graphqlClient.post('', {
//         query: `
//           mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
//             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
//               cart { id }
//               userErrors { field message }
//             }
//           }
//         `,
//         variables: { cartId, discountCodes: [DISCOUNT_CODE] },
//       });
//       console.log('✅ Gift discount applied');
//     } catch (e) {
//       console.error('applyGiftDiscount error', e);
//     }
//   };

//   const removeGiftDiscount = async (cartId: string): Promise<void> => {
//     try {
//       await graphqlClient.post('', {
//         query: `
//           mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
//             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
//               cart { id }
//               userErrors { field message }
//             }
//           }
//         `,
//         variables: { cartId, discountCodes: [] },
//       });
//       console.log('🗑️ Gift discount removed');
//     } catch (e) {
//       console.error('removeGiftDiscount error', e);
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /*  Manage free gift logic - OPTIMIZED                               */
//   /* ------------------------------------------------------------------ */
//   const manageFreeGift = async (cartId: string, cart: Cart): Promise<void> => {
//     const lines = cart.lines.edges.map((e) => e.node);
//     const giftLine = lines.find((l) => l.merchandise.id === FREE_GIFT_VARIANT_ID);
//     const hasDiscount = cart.discountCodes?.some((d) => d.code === DISCOUNT_CODE);

//     const cartSubtotal = parseFloat(cart.cost.subtotalAmount.amount);
//     const giftQuantity = giftLine?.quantity || 0;

//     console.log('📊 Cart subtotal:', cartSubtotal, '| Gift quantity:', giftQuantity, '| Has discount:', hasDiscount);

//     // Determine actions needed
//     const needsGift = cartSubtotal >= FREE_GIFT_THRESHOLD;
//     const needsDiscount = cartSubtotal >= FREE_GIFT_THRESHOLD;

//     // ========== CASE 1: Cart qualifies for free gift ==========
//     if (needsGift) {
//       const promises: Promise<any>[] = [];

//       if (!giftLine) {
//         // Add gift
//         promises.push(
//           graphqlClient.post('', {
//             query: `
//               mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
//                 cartLinesAdd(cartId: $cartId, lines: $lines) {
//                   cart { id }
//                   userErrors { field message }
//                 }
//               }
//             `,
//             variables: {
//               cartId,
//               lines: [{ merchandiseId: FREE_GIFT_VARIANT_ID, quantity: 1 }],
//             },
//           }).then(() => console.log('🎁 Free gift added (quantity: 1)'))
//         );
//       } else if (giftQuantity >= 1) {
//         // Update gift quantity
//         promises.push(
//           graphqlClient.post('', {
//             query: `
//               mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
//                 cartLinesUpdate(cartId: $cartId, lines: $lines) {
//                   cart { id }
//                   userErrors { field message }
//                 }
//               }
//             `,
//             variables: {
//               cartId,
//               lines: [{ id: giftLine.id, quantity: giftQuantity + 1 }],
//             },
//           }).then(() => console.log(`🎁 Added 1 free gift (total quantity: ${giftQuantity + 1})`))
//         );
//       }

//       // Apply discount if needed
//       if (!hasDiscount) {
//         promises.push(applyGiftDiscount(cartId));
//       }

//       // Execute all operations in parallel
//       await Promise.all(promises);
//     }
//     // ========== CASE 2: Does NOT qualify ==========
//     else {
//       const promises: Promise<any>[] = [];

//       if (giftLine && hasDiscount) {
//         const newQuantity = Math.max(0, giftQuantity - 1);

//         if (newQuantity === 0) {
//           // Remove gift completely
//           promises.push(
//             graphqlClient.post('', {
//               query: `
//                 mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
//                   cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
//                     cart { id }
//                     userErrors { field message }
//                   }
//                 }
//               `,
//               variables: { cartId, lineIds: [giftLine.id] },
//             }).then(() => console.log('🗑️ Free gift removed completely (below threshold)'))
//           );
//         } else {
//           // Reduce quantity
//           promises.push(
//             graphqlClient.post('', {
//               query: `
//                 mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
//                   cartLinesUpdate(cartId: $cartId, lines: $lines) {
//                     cart { id }
//                     userErrors { field message }
//                   }
//                 }
//               `,
//               variables: {
//                 cartId,
//                 lines: [{ id: giftLine.id, quantity: newQuantity }],
//               },
//             }).then(() => console.log(`🗑️ Free gift removed (quantity reduced to ${newQuantity})`))
//           );
//         }
//       }

//       // Remove discount if exists
//       if (hasDiscount) {
//         promises.push(removeGiftDiscount(cartId));
//       }

//       // Execute all operations in parallel
//       await Promise.all(promises);
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /*  Add single product - OPTIMIZED                                   */
//   /* ------------------------------------------------------------------ */
//   const addToCart = async (variantId: string, cartId: string, quantity: number,giftDetails:GiftDetails): Promise<void> => {
//     dispatch(toggleLoader(true));
//     setLoading(true);

//     try {
//       // Step 1: Add product to cart
//       const resp: CartResponse = await graphqlClient.post('', {
//         query: `
//           mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
//             cartLinesAdd(cartId: $cartId, lines: $lines) {
//               cart {
//                 id
//                 cost { subtotalAmount { amount } }
//                 lines(first: 100) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise { ... on ProductVariant { id title } }
//                     }
//                   }
//                 }
//                 discountCodes { code applicable }
//               }
//               userErrors { field message }
//             }
//           }
//         `,
//         variables: {
//           cartId,
//           lines: [{ merchandiseId: variantId, quantity }],
//         },
//       });

//       const cart = resp.data?.cartLinesAdd?.cart;
//       if (!cart) throw new Error('Cart update failed');

//       // Step 2: Manage free gift (no extra fetch needed, we have the data)
//       await manageFreeGift(cartId, cart);

//       // Step 3: Set data immediately without extra fetch
//       setAddCartData(cart);
//     } catch (e: any) {
//       console.error('addToCart error', e);
//       setError(e);
//     } finally {
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   /* ------------------------------------------------------------------ */
//   /*  Add multiple products (FBT) - OPTIMIZED                          */
//   /* ------------------------------------------------------------------ */
//   const addToCartFrequentlyBought = async (
//     cartId: string,
//     lineItems: LineItem[]
//   ): Promise<void> => {
//     dispatch(toggleLoader(true));
//     setLoading(true);

//     const valid = lineItems.filter((i) => i.merchandiseId && i.quantity);
//     if (!valid.length) {
//       setLoading(false);
//       dispatch(toggleLoader(false));
//       return;
//     }

//     try {
//       // Step 1: Add products to cart
//       const resp: CartResponse = await graphqlClient.post('', {
//         query: `
//           mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
//             cartLinesAdd(cartId: $cartId, lines: $lines) {
//               cart {
//                 id
//                 cost { subtotalAmount { amount } }
//                 lines(first: 100) {
//                   edges {
//                     node {
//                       id
//                       quantity
//                       merchandise { ... on ProductVariant { id title } }
//                     }
//                   }
//                 }
//                 discountCodes { code applicable }
//               }
//               userErrors { field message }
//             }
//           }
//         `,
//         variables: {
//           cartId,
//           lines: valid.map((i) => ({
//             merchandiseId: i.merchandiseId,
//             quantity: i.quantity,
//           })),
//         },
//       });

//       const cart = resp.data?.cartLinesAdd?.cart;
//       if (!cart) throw new Error('Cart update failed');

//       // Step 2: Manage free gift (no extra fetch needed)
//       await manageFreeGift(cartId, cart);

//       // Step 3: Set data immediately without extra fetch
//       setAddCartData(cart);
//     } catch (e: any) {
//       console.error('addToCartFrequentlyBought error', e);
//       setError(e);
//     } finally {
//       setLoading(false);
//       dispatch(toggleLoader(false));
//     }
//   };

//   return { addCartData, addToCart, addToCartFrequentlyBought, loading, error };
// };

// export default useAddToCart;

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
  merchandise: { id: string; title: string };
  cost?: { totalAmount: { amount: string } };
  attributes?: { key: string; value: string }[];
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
    cartLinesAdd?: { cart: Cart; userErrors: { field: string; message: string }[] };
    cartLinesRemove?: { cart: Cart; userErrors: { field: string; message: string }[] };
    cartDiscountCodesUpdate?: { cart: Cart; userErrors: { field: string; message: string }[] };
  };
}
interface LineItem {
  merchandiseId: string;
  quantity: number;
}
type GiftDetails = {
  discountCode?: string; // only set if your BXGY is a code (leave undefined if Automatic)
  gift: boolean;
  giftThreshold: number;
  productId: string;     // gift variant GID
};

/* =========================
   HOOK
========================= */
const useAddToCart = () => {
  const [addCartData, setAddCartData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  // from Redux (state.globalReducer.details)
  const giftDetails = useSelector<RootState, GiftDetails | null>(
    (state) => (state as RootState).globalReducer?.details ?? null
  );

  /* ---------- Helpers ---------- */
  const isFreeGift = (l: CartLineNode) =>
    (l.attributes ?? []).some(a => a.key === '_free_gift' && a.value === '1');

  const subtotalExcludingTaggedGift = (cart: Cart) =>
    cart.lines.edges.reduce((acc, { node }) => {
      if (isFreeGift(node)) return acc;
      const amt = parseFloat(node.cost?.totalAmount?.amount ?? '0');
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);

  const getActiveCodes = (cart?: Cart) =>
    (cart?.discountCodes ?? []).map(d => d.code).filter(Boolean);

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
    if (!code) return; // Automatic discount: nothing to apply
    const codes = getActiveCodes(cart);
    if (!codes.includes(code)) {
      await setDiscountCodes(cartId, [...codes, code]);
      console.log('✅ Discount code applied:', code);
    }
  };

  const ensureDiscountRemoved = async (cartId: string, cart: Cart, code?: string) => {
    if (!code) return; // Automatic discount: nothing to remove
    const codes = getActiveCodes(cart);
    if (codes.includes(code)) {
      await setDiscountCodes(cartId, codes.filter(c => c !== code));
      console.log('🗑️ Discount code removed:', code);
    }
  };

  /* ---------- Gift management (caps tagged gift to 1; never touch untagged) ---------- */
  const manageFreeGift = async (
    cartId: string,
    cart: Cart,
    details: GiftDetails,
    opts?: { avoidReAdd?: boolean }
  ): Promise<void> => {
    const { productId: GIFT_ID, giftThreshold: THRESHOLD, discountCode } = details;

    const lines = cart.lines.edges.map(e => e.node);

    // Split gift lines into tagged vs untagged (paid)
    const taggedGiftLines = lines.filter(l => l.merchandise.id === GIFT_ID && isFreeGift(l));
    const untaggedGiftLines = lines.filter(l => l.merchandise.id === GIFT_ID && !isFreeGift(l));

    let tagged = taggedGiftLines[0] ?? null;
    const qualifies = subtotalExcludingTaggedGift(cart) >= THRESHOLD;

    // If multiple tagged lines slipped in, keep first, remove the rest
    if (taggedGiftLines.length > 1) {
      const extraIds = taggedGiftLines.slice(1).map(l => l.id);
      await graphqlClient.post('', {
        query: `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
          }
        `,
        variables: { cartId, lineIds: extraIds },
      });
      console.log('🧹 Deduped extra tagged gift lines');
    }

    if (qualifies) {
      // respect manual delete inside same cycle
      if (!tagged && opts?.avoidReAdd) {
        await ensureDiscountRemoved(cartId, cart, discountCode);
        return;
      }

      // ensure one tagged line exists (qty=1). Do not touch untagged (paid) lines.
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
        console.log('🎁 Added tagged gift (qty 1)');
      } else if (tagged.quantity !== 1) {
        await graphqlClient.post('', {
          query: `
            mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } }
            }
          `,
          variables: { cartId, lines: [{ id: tagged.id, quantity: 1 }] },
        });
        console.log('🔧 Capped tagged gift to qty 1');
      }

      // Apply discount only if a tagged gift line exists (BXGY will discount 1 unit only)
      await ensureDiscountPresent(cartId, cart, discountCode);
      return;
    }

    // Below threshold → remove only the tagged gift; leave untagged (paid) intact
    if (tagged) {
      await graphqlClient.post('', {
        query: `
          mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
          }
        `,
        variables: { cartId, lineIds: [tagged.id] },
      });
      console.log('🗑️ Removed tagged gift (below threshold)');
    }
    await ensureDiscountRemoved(cartId, cart, discountCode);
  };

  /* ---------- Add single product ---------- */
  const addToCart = async (
    variantId: string,
    cartId: string,
    quantity: number
  ): Promise<void> => {
    if (!giftDetails?.productId) {
      console.warn('Gift details not ready; skipping gift logic');
    }
    console.log(giftDetails, 'giftDetails');


    dispatch(toggleLoader(true));
    setLoading(true);
    setError(null);

    try {
      const resp: CartResponse = await graphqlClient.post('', {
        query: `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                id
                cost { subtotalAmount { amount } }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      attributes { key value }
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
        variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
      });

      const cart = resp.data?.cartLinesAdd?.cart;
      if (!cart) throw new Error('Cart update failed');

      if (giftDetails?.productId) {
        await manageFreeGift(cartId, cart, giftDetails);
      }
      setAddCartData(cart);
    } catch (e: any) {
      console.error('addToCart error', e);
      setError(e);
    } finally {
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  /* ---------- Add multiple products (FBT) ---------- */
  const addToCartFrequentlyBought = async (
    cartId: string,
    lineItems: LineItem[]
  ): Promise<void> => {
    if (!giftDetails?.productId) {
      console.warn('Gift details not ready; skipping gift logic');
    }
    console.log(giftDetails, 'giftDetails');

    dispatch(toggleLoader(true));
    setLoading(true);
    setError(null);

    const valid = lineItems.filter(i => i.merchandiseId && i.quantity);
    if (!valid.length) {
      setLoading(false);
      dispatch(toggleLoader(false));
      return;
    }

    try {
      const resp: CartResponse = await graphqlClient.post('', {
        query: `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                id
                cost { subtotalAmount { amount } }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      attributes { key value }
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
        variables: {
          cartId,
          lines: valid.map(i => ({ merchandiseId: i.merchandiseId, quantity: i.quantity })),
        },
      });

      const cart = resp.data?.cartLinesAdd?.cart;
      if (!cart) throw new Error('Cart update failed');

      if (giftDetails?.productId) {
        await manageFreeGift(cartId, cart, giftDetails);
      }
      setAddCartData(cart);
    } catch (e: any) {
      console.error('addToCartFrequentlyBought error', e);
      setError(e);
    } finally {
      setLoading(false);
      dispatch(toggleLoader(false));
    }
  };

  return { addCartData, addToCart, addToCartFrequentlyBought, loading, error };
};

export default useAddToCart;
