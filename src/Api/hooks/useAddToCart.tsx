/* eslint-disable no-catch-shadow */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import graphqlClient from '../interceptor';
import { useDispatch } from 'react-redux';
import { toggleLoader } from '../../redux/reducers/GlobalReducer';

// ====== CONFIGURATION ======
const FREE_GIFT_VARIANT_ID = "gid://shopify/ProductVariant/51955052773665";
const FREE_GIFT_THRESHOLD = 30; // 30 QAR

// IMPORTANT: You need to create a separate "Free Gift" variant in Shopify with price = 0
// OR remove discount code logic entirely and inform customers the gift is added but they pay for it
// Shopify discount codes cannot target specific line items - they apply to entire cart

// ====== TYPES ======
interface CartLine {
  node: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
    };
    attributes: {
      key: string;
      value: string;
    }[];
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
    cartLinesAdd?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
    cartLinesRemove?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
    cartDiscountCodesUpdate?: {
      cart: Cart;
      userErrors: { field: string; message: string }[];
    };
  };
}

interface LineItem {
  merchandiseId: string;
  quantity: number;
}

// ====== HOOK ======
const useAddToCart = () => {
  const [addCartData, setAddCartData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();

  /**
   * Check and manage free gift based on cart subtotal
   * Only manages gifts with the "isAutoGift" attribute
   * 
   * NOTE: This adds the gift but does NOT make it free.
   * To make it free, you need to:
   * 1. Create a separate variant in Shopify with price = 0 for the free gift
   * 2. OR use Shopify Scripts/Functions to apply line-item discounts
   */
  const manageFreeGift = async (
    cartId: string,
    cart: Cart
  ): Promise<void> => {
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const lineItems = cart.lines.edges.map((edge) => edge.node);
    
    // Find the AUTO gift (marked with isAutoGift attribute)
    const autoGiftLine = lineItems.find(
      (item) => 
        item.merchandise.id === FREE_GIFT_VARIANT_ID &&
        item.attributes.some(attr => attr.key === 'isAutoGift' && attr.value === 'true')
    );
    
    // Add gift if threshold is met
    if (subtotal >= FREE_GIFT_THRESHOLD && !autoGiftLine) {
      try {
        // Add gift product with attribute marking it as auto-gift
        await graphqlClient.post('', {
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
            lines: [{
              merchandiseId: FREE_GIFT_VARIANT_ID,
              quantity: 1,
              attributes: [
                { key: 'isAutoGift', value: 'true' },
                { key: '_freeGift', value: 'true' } // Additional marker for potential discount scripts
              ]
            }],
          },
        });

        console.log('✅ Free gift added! (Note: To make it $0, create a separate free variant in Shopify)');
      } catch (err) {
        console.error('Error adding free gift:', err);
      }
    }
    // Remove ONLY auto-gift if below threshold
    else if (subtotal < FREE_GIFT_THRESHOLD && autoGiftLine) {
      try {
        // Remove gift product
        await graphqlClient.post('', {
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
            lineIds: [autoGiftLine.id],
          },
        });

        console.log('🗑️ Free gift removed');
      } catch (err) {
        console.error('Error removing free gift:', err);
      }
    }
  };

  /**
   * Add single product to cart
   */
  const addToCart = async (
    variantId: string,
    cartId: string,
    quantity: number
  ): Promise<void> => {
    dispatch(toggleLoader(true));
    setLoading(true);

    try {
      const response: CartResponse = await graphqlClient.post('', {
        query: `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
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
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                        }
                      }
                      quantity
                      attributes {
                        key
                        value
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
                field
                message
              }
            }
          }
        `,
        variables: {
          cartId,
          lines: [
            {
              merchandiseId: variantId,
              quantity,
            },
          ],
        },
      });

      const cart = response.data?.cartLinesAdd?.cart;
      const userErrors = response.data?.cartLinesAdd?.userErrors;

      if (userErrors && userErrors.length > 0) {
        console.error('User Errors:', userErrors);
        throw new Error(userErrors[0].message);
      }

      if (!cart) {
        throw new Error('Cart update failed');
      }

      // Manage free gift based on cart total
      await manageFreeGift(cartId, cart);

      // Fetch updated cart after gift management
      const updatedResponse: CartResponse = await graphqlClient.post('', {
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
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                      }
                    }
                    quantity
                    attributes {
                      key
                      value
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
        variables: { cartId },
      });

      const finalCart = updatedResponse.data?.cart || cart;
      setAddCartData(finalCart);
      setLoading(false);
    } catch (error: any) {
      console.error('Error in addToCart:', error);
      setError(error);
      setLoading(false);
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  /**
   * Add multiple products to cart (Frequently Bought Together)
   */
  const addToCartFrequentlyBought = async (
    checkoutId: string,
    lineItems: LineItem[],
    ymqOptions?: any
  ): Promise<void> => {
    dispatch(toggleLoader(true));
    setLoading(true);

    try {
      const validLineItems = lineItems.filter(
        (item) => item.merchandiseId && item.quantity
      );

      if (validLineItems.length === 0) {
        console.warn('No valid line items to add');
        dispatch(toggleLoader(false));
        setLoading(false);
        return;
      }

      const response: CartResponse = await graphqlClient.post('', {
        query: `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
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
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                        }
                      }
                      quantity
                      attributes {
                        key
                        value
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
                field
                message
              }
            }
          }
        `,
        variables: {
          cartId: checkoutId,
          lines: validLineItems.map((item) => ({
            merchandiseId: item.merchandiseId,
            quantity: item.quantity,
          })),
        },
      });

      const cart = response.data?.cartLinesAdd?.cart;
      const userErrors = response.data?.cartLinesAdd?.userErrors;

      if (!cart) {
        console.error('No cart data returned or invalid response structure.');
        throw new Error('Cart update failed');
      }

      if (userErrors && userErrors.length > 0) {
        console.error('User Errors:', userErrors);
      }

      // Manage free gift based on cart total
      await manageFreeGift(checkoutId, cart);

      // Fetch updated cart after gift management
      const updatedResponse: CartResponse = await graphqlClient.post('', {
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
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                      }
                    }
                    quantity
                    attributes {
                      key
                      value
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
        variables: { cartId: checkoutId },
      });

      const finalCart = updatedResponse.data?.cart || cart;
      setAddCartData(finalCart);
      setLoading(false);
    } catch (error: any) {
      console.error('Error in addToCartFrequentlyBought:', error);
      setError(error);
      setLoading(false);
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  return { addCartData, addToCart, addToCartFrequentlyBought, loading, error };
};

export default useAddToCart;