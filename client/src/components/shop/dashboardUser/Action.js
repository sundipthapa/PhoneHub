

// Action.js
import {
  getUserById,
  updatePersonalInformationFetch,
  getOrderByUser,
  updatePassword,
} from "./FetchApi";
import { toast } from "react-toastify";



export const logout = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("cart");
  localStorage.removeItem("wishList");
  
  // Function to delete a specific cookie
  const deleteCookie = (name) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  };

  // Call deleteCookie for each cookie you want to remove
  deleteCookie('jwt'); // replace 'cookieName1' with your cookie names
  deleteCookie('cookieName2'); // replace 'cookieName2' with your cookie names
  
  toast.success("Logout successfully");
  setTimeout(() => {
    window.location.href = "/";
  }, 2000);
};

const getUserIdFromLocalStorage = () => {
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  return jwt && jwt.user ? jwt.user._id : null;
};

export const fetchData = async (dispatch) => {
  dispatch({ type: "loading", payload: true });
  let userId = getUserIdFromLocalStorage();
  if (!userId) {
    console.log("User ID not found");
    dispatch({ type: "loading", payload: false });
    return;
  }
  try {
    let responseData = await getUserById(userId);
    setTimeout(() => {
      if (responseData && responseData.User) {
        dispatch({ type: "userDetails", payload: responseData.User });
        dispatch({ type: "loading", payload: false });
      }
    }, 500);
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
  }
};

export const fetchOrderByUser = async (dispatch) => {
  dispatch({ type: "loading", payload: true });
  let userId = getUserIdFromLocalStorage();
  if (!userId) {
    console.log("User ID not found");
    dispatch({ type: "loading", payload: false });
    return;
  }
  try {
    let responseData = await getOrderByUser(userId);
    setTimeout(() => {
      if (responseData && responseData.Order) {
        console.log(responseData);
        dispatch({ type: "OrderByUser", payload: responseData.Order });
        dispatch({ type: "loading", payload: false });
      }
    }, 500);
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
  }
};

export const updatePersonalInformationAction = async (dispatch, fData) => {
  const formData = {
    uId: fData.id,
    name: fData.name,
    phoneNumber: fData.phone,
  };
  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await updatePersonalInformationFetch(formData);
    setTimeout(() => {
      if (responseData && responseData.success) {
        dispatch({ type: "loading", payload: false });
        fetchData(dispatch);
      }
    }, 500);
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
  }
};

export const handleChangePassword = async (fData, setFdata, dispatch) => {
  if (!fData.oldPassword || !fData.newPassword || !fData.confirmPassword) {
    setFdata({
      ...fData,
      error: "Please provide your old password, new password, and confirm your new password",
    });
    return;
  } else if (fData.newPassword !== fData.confirmPassword) {
    setFdata({ ...fData, error: "Passwords don't match" });
    return;
  }

  // Validate new password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  if (!passwordRegex.test(fData.newPassword)) {
    setFdata({ ...fData, error: "Password must be 8-20 characters long and include uppercase, lowercase, numbers, and symbols" });
    return;
  }

  const userId = getUserIdFromLocalStorage();
  if (!userId) {
    console.log("User ID not found");
    return;
  }

  const formData = {
    uId: userId,
    oldPassword: fData.oldPassword,
    newPassword: fData.newPassword,
  };

  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await updatePassword(formData);
    if (responseData && responseData.success) {
      setFdata({
        ...fData,
        success: responseData.success,
        error: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      dispatch({ type: "loading", payload: false });
    } else if (responseData.error) {
      dispatch({ type: "loading", payload: false });
      setFdata({
        ...fData,
        error: responseData.error,
        success: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
  }
};
