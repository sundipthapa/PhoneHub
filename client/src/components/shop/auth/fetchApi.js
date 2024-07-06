import axios from 'axios';

const apiURL = 'http://localhost:8000';

axios.defaults.withCredentials = true;

export const isAuthenticate = () =>
  localStorage.getItem('jwt') ? JSON.parse(localStorage.getItem('jwt')) : false;

export const isAdmin = () =>
  localStorage.getItem('jwt')
    ? JSON.parse(localStorage.getItem('jwt')).user?.role === 1
    : false;

export const loginReq = async ({ email, password, _csrf }) => {
  const data = { email, password, _csrf };
  try {
    let res = await axios.post(`${apiURL}/api/auth/signin`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const signupReq = async ({ name, email, password, cPassword, _csrf }) => {
  const data = { name, email, password, cPassword, _csrf };
  try {
    let res = await axios.post(`${apiURL}/api/auth/signup`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const requestNewPassword = async ({ email }) => {
  const data = { email };
  try {
    let res = await axios.post(`${apiURL}/api/reset-password/request`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// export const resetNewPassword = async ({ password }) => {
//   const data = { password };
//   try {
//     let res = await axios.post(`${apiURL}/api/reset-password/reset/${userId}/${token}`, data);
//     return res.data;
//   } catch (error) {
//     console.log(error);
//   }
// };



export const getCSRFToken = async () => {
  try {
    const response = await axios.get(`${apiURL}/api/auth/get-csrf-token`);
    console.log(response.data.csrfToken)
    return response.data.csrfToken;
  } catch (error) {
    console.log(error);
  }
};
