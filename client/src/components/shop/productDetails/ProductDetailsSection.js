import React, { Fragment, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LayoutContext } from "../layout";
import { ProductDetailsContext } from "./index";
import ProductDetailsSectionTwo from "./ProductDetailsSectionTwo";
import Submenu from "./Submenu";

import { cartListProduct } from "../partials/FetchApi";
import { getSingleProduct } from "./FetchApi";

import { isWish, isWishReq, unWishReq } from "../home/Mixins";
import { totalCost } from "../partials/Mixins";
import { addToCart, cartList, slideImage, updateQuantity } from "./Mixins";

// Images
import Delivered from "../../../images/product-page/delivery.avif";
import Online from "../../../images/product-page/pay.avif";
import courier from "../../../images/product-page/courier.avif";
import easyReturn from "../../../images/product-page/easy.avif";

const apiURL = 'http://localhost:8000'

const ProductDetailsSection = (props) => {
  let { id } = useParams();

  const { data, dispatch } = useContext(ProductDetailsContext);
  const { data: layoutData, dispatch: layoutDispatch } =
    useContext(LayoutContext); // Layout Context

  const sProduct = layoutData.singleProductDetail;
  const [pImages, setPimages] = useState(null);
  const [count, setCount] = useState(0); // Slide change state

  const [quantitiy, setQuantitiy] = useState(1); // Increse and decrese quantity state
  const [, setAlertq] = useState(false); // Alert when quantity greater than stock

  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList"))
  ); // Wishlist State Control

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getSingleProduct(id);
      setTimeout(() => {
        if (responseData.Product) {
          layoutDispatch({
            type: "singleProductDetail",
            payload: responseData.Product,
          }); // Dispatch in layout context
          setPimages(responseData.Product.pImages);
          dispatch({ type: "loading", payload: false });
          layoutDispatch({ type: "inCart", payload: cartList() }); // This function change cart in cart state
        }
        if (responseData.error) {
          console.log(responseData.error);
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
    fetchCartProduct(); // Updating cart total
  };

  const fetchCartProduct = async () => {
    try {
      let responseData = await cartListProduct();
      if (responseData && responseData.Products) {
        layoutDispatch({ type: "cartProduct", payload: responseData.Products }); // Layout context Cartproduct fetch and dispatch
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (data.loading) {
    return (
      <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-center h-screen">
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
    );
  } else if (!sProduct) {
    return <div>No product</div>;
  }
  return (
    <Fragment>
      <Submenu
        value={{
          categoryId: sProduct.pCategory._id,
          product: sProduct.pName,
          category: sProduct.pCategory.cName,
        }}
      />
      <section className="m-4 md:mx-12 md:my-6">
        <div className="grid grid-cols-2 md:grid-cols-12">
          <div className="hidden md:block md:col-span-1 md:flex md:flex-col md:space-y-4 md:mr-2">
            <img
              onClick={(e) =>
                slideImage("increase", 0, count, setCount, pImages)
              }
              className={`${count === 0 ? "" : "opacity-25"
                } cursor-pointer w-20 h-20 object-cover object-center`}
              src={`${apiURL}/uploads/products/${sProduct.pImages[0]}`}
              alt="pic"
            />
            <img
              onClick={(e) =>
                slideImage("increase", 1, count, setCount, pImages)
              }
              className={`${count === 1 ? "" : "opacity-25"
                } cursor-pointer w-20 h-20 object-cover object-center`}
              src={`${apiURL}/uploads/products/${sProduct.pImages[1]}`}
              alt="pic"
            />
          </div>
          <div className="col-span-2 md:col-span-4">
            <div className="relative">
              <img
                className="w-full"
                src={`${apiURL}/uploads/products/${sProduct.pImages[count]}`}
                alt="Pic"
              />
              <div className="absolute inset-0 flex justify-between items-center mb-4">
                <svg
                  onClick={(e) =>
                    slideImage("increase", null, count, setCount, pImages)
                  }
                  className="flex justify-center  w-12 h-12 text-gray-700 opacity-25 cursor-pointer hover:text-yellow-700 hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  onClick={(e) =>
                    slideImage("increase", null, count, setCount, pImages)
                  }
                  className="flex justify-center  w-12 h-12 text-gray-700 opacity-25 cursor-pointer hover:text-yellow-700 hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="col-span-2 mt-8 md:mt-0 md:col-span-7 md:ml-6 lg:ml-12">
            <div className="flex flex-col leading-8">
              <div className="text-2xl tracking-wider">{sProduct.pName}</div>
              <div className="flex justify-between items-center">
                <span className="text-xl tracking-wider text-yellow-700">
                  Rs.
                  {sProduct.pPrice}
                </span>
                <span>
                  <svg
                    onClick={(e) => isWishReq(e, sProduct._id, setWlist)}
                    className={`${isWish(sProduct._id, wList) && "hidden"
                      } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <svg
                    onClick={(e) => unWishReq(e, sProduct._id, setWlist)}
                    className={`${!isWish(sProduct._id, wList) && "hidden"
                      } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className="my-4 md:my-6 text-gray-600">
              {/* {sProduct.pDescription} */}
              {/* review starts */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 fill-current text-yellow-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {/* {sProduct.pRatingsReviews.rating} */}
                    4.5
                  </span>
                  <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  200 Reviews
                  {/* {sProduct.pRatingsReviews.reviews} */}
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg text font-bold">
                    Company / Manufacture:
                  </span>
                </div>
                <a className="text-lg text-gray-700" href="/">
                  {/* {sProduct.pCompany} */} Phone Hub Tech Pvt. Ltd.
                </a>
                <span className="text-lg text-yellow-700">Best Seller</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-lg tracking-wider text-gray-700 mt-2">
                  <span>Country Of Origin: Nepal</span>
                </div>
              </div>
            </div>
            <hr className="my-2" />
            <div className="my-4 md:my-6">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span>Delivery to</span>
                  <input
                    className="border-2 p-2"
                    type="text"
                    placeholder="Enter Pincode"
                  />
                  <button className="bg-green-500 text-white px-2 py-1 rounded-md">
                    Check
                  </button>
                </div>
              </div>
            </div>
            <div className="my-4 md:my-6 grid grid-cols-5">
              {+quantitiy === +sProduct.pQuantity ? (
                <span className="text-xs text-red-500">Stock limited</span>
              ) : (
                ""
              )}
              <div
                className={`flex justify-between items-center px-4 py-2 border ${+quantitiy === +sProduct.pQuantity && "border-red-500"
                  }`}
              >
                <div
                  className={`${quantitiy === sProduct.pQuantity && "text-red-500"
                    }`}
                >
                  Quantity
                </div>
                {/* Quantity Button */}
                {sProduct.pQuantity !== 0 ? (
                  <Fragment>
                    {layoutData.inCart == null ||
                      (layoutData.inCart !== null &&
                        layoutData.inCart.includes(sProduct._id) === false) ? (
                      <div className="flex items-center space-x-2">
                        <span
                          onClick={(e) =>
                            updateQuantity(
                              "decrease",
                              sProduct.pQuantity,
                              quantitiy,
                              setQuantitiy,
                              setAlertq
                            )
                          }
                        >
                          <svg
                            className="w-5 h-5 fill-current cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">{quantitiy}</span>
                        <span
                          onClick={(e) =>
                            updateQuantity(
                              "increase",
                              sProduct.pQuantity,
                              quantitiy,
                              setQuantitiy,
                              setAlertq
                            )
                          }
                        >
                          <svg
                            className="w-5 h-5 fill-current cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>
                          <svg
                            className="w-5 h-5 fill-current cursor-not-allowed"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">{quantitiy}</span>
                        <span>
                          <svg
                            className="w-5 h-5 fill-current cursor-not-allowed"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>
                      <svg
                        className="w-5 h-5 fill-current cursor-not-allowed"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="font-semibold">{quantitiy}</span>
                    <span>
                      <svg
                        className="w-5 h-5 fill-current cursor-not-allowed"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                )}
                {/* Quantity Button End */}
              </div>
              {/* Incart and out of stock button */}
              {sProduct.pQuantity !== 0 ? (
                <Fragment>
                  {layoutData.inCart !== null &&
                    layoutData.inCart.includes(sProduct._id) === true ? (
                    <div
                      style={{ background: "#303031" }}
                      className={`px-4 py-2 text-white text-center cursor-not-allowed uppercase opacity-75`}
                    >
                      In cart
                    </div>
                  ) : (
                    <div
                      onClick={(e) =>
                        addToCart(
                          sProduct._id,
                          quantitiy,
                          sProduct.pPrice,
                          layoutDispatch,
                          setQuantitiy,
                          setAlertq,
                          fetchData,
                          totalCost
                        )
                      }
                      style={{ background: "#303031" }}
                      className={`px-4 py-2 text-white text-center cursor-pointer uppercase`}
                    >
                      Add to cart
                    </div>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  {layoutData.inCart !== null &&
                    layoutData.inCart.includes(sProduct._id) === true ? (
                    <div
                      style={{ background: "#303031" }}
                      className={`px-4 py-2 text-white text-center cursor-not-allowed uppercase opacity-75`}
                    >
                      In cart
                    </div>
                  ) : (
                    <div
                      style={{ background: "#303031" }}
                      disabled={true}
                      className="px-4 py-2 text-white opacity-50 cursor-not-allowed text-center uppercase"
                    >
                      Out of stock
                    </div>
                  )}
                </Fragment>
              )}
            </div>

            <hr className="my-2" />
            <div className="flex space-y-2">
              <div className="container grid grid-cols-5 p-4">
                <div className="w-24">
                  <img src={Online} alt="" />
                  <span>Online Payment</span>
                </div>

                <div className="w-24">
                  <img src={easyReturn} alt="" />
                  <span>Easy Returns</span>
                </div>

                <div className="w-24">
                  <img src={Delivered} alt="" />
                  <span>Delivered</span>
                </div>

                <div className="w-24">
                  <img src={courier} alt="" />
                  <span>Courier</span>
                </div>

                <div className="w-24">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Ask Question To Seller
                  </button>
                </div>
              </div>
            </div>
            <hr className="my-2" />
          </div>
        </div>
      </section>
      {/* Product Details Section two */}
      <ProductDetailsSectionTwo />
    </Fragment>
  );
};

export default ProductDetailsSection;
