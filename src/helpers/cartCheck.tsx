import graphqlClient from "../Api/interceptor";

export const isCartExpired = async (checkoutId: string): Promise<boolean> => {
  try {
    const response = await graphqlClient.post('', {
      query: `
        query ($id: ID!) {
          cart(id: $id) { id }
        }
      `,
      variables: { id: checkoutId },
    });
     console.log(response,'responseresponse');
     
    return !response.data?.cart; // true if expired
  } catch (error) {
    console.error('Cart check failed:', error);
    return true; // assume expired on error
  }
};