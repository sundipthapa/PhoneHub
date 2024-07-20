import React, { Fragment, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { LayoutContext } from "../layout";
import { quantity, subTotal, totalCost } from "../partials/Mixins";

import { cartListProduct } from "../partials/FetchApi";
import { fetchData, fetchbrainTree, pay } from "./Action";
import { getBrainTreeToken, getPaymentProcess } from "./FetchApi";

import DropIn from "braintree-web-drop-in-react";

const apiURL = 'http://localhost:8000';

export const CheckoutComponent = (props) => {
  const history = useHistory();
  const { data, dispatch } = useContext(LayoutContext);

  const [state, setState] = useState({
    address: "",
    phone: "",
    error: false,
    success: false,
    clientToken: null,
    instance: {},
  });

  useEffect(() => {
    fetchData(cartListProduct, dispatch);
    fetchbrainTree(getBrainTreeToken, setState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Please wait until it finishes
      </div>
    );
  }

  return (
    <Fragment>
      <section className="mx-4 mt-20 md:mx-12 md:mt-32 lg:mt-24">
        <div className="text-3xl font-semibold text-center mb-8">Checkout</div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-2/3">
            <CheckoutProducts products={data.cartProduct} />
          </div>
          <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-md shadow-lg">
            {state.clientToken !== null ? (
              <Fragment>
                <div
                  onBlur={(e) => setState({ ...state, error: false })}
                  className="space-y-4"
                >
                  {state.error && (
                    <div className="bg-red-200 py-2 px-4 rounded text-red-800">
                      {state.error}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <label htmlFor="address" className="pb-2 font-medium">
                      Delivery Address
                    </label>
                    <input
                      value={state.address}
                      onChange={(e) =>
                        setState({
                          ...state,
                          address: e.target.value,
                          error: false,
                        })
                      }
                      type="text"
                      id="address"
                      className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="Address..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="phone" className="pb-2 font-medium">
                      Phone
                    </label>
                    <input
                      value={state.phone}
                      onChange={(e) =>
                        setState({
                          ...state,
                          phone: e.target.value,
                          error: false,
                        })
                      }
                      type="tel"
                      id="phone"
                      className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="+997"
                    />
                  </div>
                  <DropIn
                    options={{
                      authorization: state.clientToken,
                      paypal: {
                        flow: "vault",
                      },
                    }}
                    onInstance={(instance) => (state.instance = instance)}
                  />
                  <div
                    onClick={(e) =>
                      pay(
                        data,
                        dispatch,
                        state,
                        setState,
                        getPaymentProcess,
                        totalCost,
                        history
                      )
                    }
                    className="w-full px-4 py-2 mt-4 text-center text-white font-semibold bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700"
                  >
                    Pay Now
                  </div>
                </div>
              </Fragment>
            ) : (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="w-12 h-12 animate-spin text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

const CheckoutProducts = ({ products }) => {
  const history = useHistory();

  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-4">
        {products !== null && products.length > 0 ? (
          products.map((product, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-md shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <img
                    onClick={() => history.push(`/products/${product._id}`)}
                    className="cursor-pointer h-20 w-20 object-cover object-center rounded-md"
                    src={`${apiURL}/uploads/products/${product.pImages[0]}`}
                    alt="Product"
                  />
                  <div className="text-lg font-medium truncate">
                    {product.pName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Price: Rs. {product.pPrice}
                  </div>
                  <div className="text-sm text-gray-600">
                    Quantity: {quantity(product._id)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Subtotal: Rs. {subTotal(product._id, product.pPrice)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-600">No products found for checkout</div>
        )}
      </div>
    </Fragment>
  );
};

export default CheckoutProducts;
