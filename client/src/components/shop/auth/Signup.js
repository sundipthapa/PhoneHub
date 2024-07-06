// import React, { Fragment, useState } from "react";
// import { signupReq } from "./fetchApi";

// const Signup = (props) => {
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     cPassword: "",
//     error: false,
//     loading: false,
//     success: false,
//   });

//   const alert = (msg, type) => (
//     <div className={`text-sm text-${type}-500`}>{msg}</div>
//   );

//   const formSubmit = async () => {
//     setData({ ...data, loading: true });
//     if (data.cPassword !== data.password) {
//       return setData({
//         ...data,
//         error: {
//           cPassword: "Password doesn't match",
//           password: "Password doesn't match",
//         },
//       });
//     }
//     try {
//       let responseData = await signupReq({
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         cPassword: data.cPassword,
//       });
//       if (responseData.error) {
//         setData({
//           ...data,
//           loading: false,
//           error: responseData.error,
//           password: "",
//           cPassword: "",
//         });
//       } else if (responseData.success) {
//         setData({
//           success: responseData.success,
//           name: "",
//           email: "",
//           password: "",
//           cPassword: "",
//           loading: false,
//           error: false,
//         });
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <Fragment>
//       <div className="text-center text-2xl mb-6">Register</div>
//       <form className="space-y-4">
//         {data.success ? alert(data.success, "green") : ""}
//         <div className="flex flex-col">
//           <label htmlFor="name">
//             Name<span className="text-sm text-gray-600 ml-1">*</span>
//           </label>
//           <input
//             onChange={(e) =>
//               setData({
//                 ...data,
//                 success: false,
//                 error: {},
//                 name: e.target.value,
//               })
//             }
//             value={data.name}
//             type="text"
//             id="name"
//             className={`${
//               data.error.name ? "border-red-500" : ""
//             } px-4 py-2 focus:outline-none border`}
//           />
//           {!data.error ? "" : alert(data.error.name, "red")}
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="email">
//             Email address<span className="text-sm text-gray-600 ml-1">*</span>
//           </label>
//           <input
//             onChange={(e) =>
//               setData({
//                 ...data,
//                 success: false,
//                 error: {},
//                 email: e.target.value,
//               })
//             }
//             value={data.email}
//             type="email"
//             id="email"
//             className={`${
//               data.error.email ? "border-red-500" : ""
//             } px-4 py-2 focus:outline-none border`}
//           />
//           {!data.error ? "" : alert(data.error.email, "red")}
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="password">
//             Password<span className="text-sm text-gray-600 ml-1">*</span>
//           </label>
//           <input
//             onChange={(e) =>
//               setData({
//                 ...data,
//                 success: false,
//                 error: {},
//                 password: e.target.value,
//               })
//             }
//             value={data.password}
//             type="password"
//             id="password"
//             className={`${
//               data.error.password ? "border-red-500" : ""
//             } px-4 py-2 focus:outline-none border`}
//           />
//           {!data.error ? "" : alert(data.error.password, "red")}
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="cPassword">
//             Confirm password
//             <span className="text-sm text-gray-600 ml-1">*</span>
//           </label>
//           <input
//             onChange={(e) =>
//               setData({
//                 ...data,
//                 success: false,
//                 error: {},
//                 cPassword: e.target.value,
//               })
//             }
//             value={data.cPassword}
//             type="password"
//             id="cPassword"
//             className={`${
//               data.error.cPassword ? "border-red-500" : ""
//             } px-4 py-2 focus:outline-none border`}
//           />
//           {!data.error ? "" : alert(data.error.cPassword, "red")}
//         </div>
//         <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
//           <div>
//             <input
//               type="checkbox"
//               id="rememberMe"
//               className="px-4 py-2 focus:outline-none border mr-1"
//             />
//             <label htmlFor="rememberMe">
//               Remember me<span className="text-sm text-gray-600">*</span>
//             </label>
//           </div>
//           <a className="block text-gray-600" href="/">
//             Lost your password?
//           </a>
//         </div>
//         <div
//           onClick={(e) => formSubmit()}
//           style={{ background: "#303031" }}
//           className="px-4 py-2 text-white text-center cursor-pointer font-medium"
//         >
//           Create an account
//         </div>
//       </form>
//     </Fragment>
//   );
// };

// export default Signup;

import React, { Fragment, useState, useEffect } from "react";
import { signupReq, getCSRFToken } from "./fetchApi";
import zxcvbn from "zxcvbn";
import { toast } from 'react-toastify';

const Signup = (props) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    cPassword: "",
    csrfToken: "",
    error: {},
    loading: false,
    success: false,
    passwordStrength: "",
  });

  useEffect(() => {
    const fetchCSRFToken = async () => {
      const token = await getCSRFToken();
      setData((prevData) => ({ ...prevData, csrfToken: token }));
    };
    fetchCSRFToken();
  }, []);

  const validatePassword = (password) => {
    const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    const errors = {};

    if (password.length < 8 || password.length > 12) {
      errors.password = "Password must be between 8 and 12 characters";
    } else if (!passwordComplexity.test(password)) {
      errors.password = "Password must include uppercase, lowercase, number, and special character";
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const { score } = zxcvbn(password);
    setData((prevData) => ({
      ...prevData,
      password,
      passwordStrength: score,
    }));
  };

  const handleSubmit = async () => {
    setData({ ...data, loading: true });

    if (data.password !== data.cPassword) {
      return setData({
        ...data,
        error: { cPassword: "Passwords do not match", password: "Passwords do not match" },
        loading: false,
      });
    }

    const passwordErrors = validatePassword(data.password);
    if (Object.keys(passwordErrors).length > 0) {
      return setData({
        ...data,
        error: passwordErrors,
        loading: false,
      });
    }

    try {
      let responseData = await signupReq({
        name: data.name,
        email: data.email,
        password: data.password,
        cPassword: data.cPassword,
        _csrf: data.csrfToken,
      });

      if (responseData.error) {
        setData({
          ...data,
          loading: false,
          error: responseData.error,
          password: "",
          cPassword: "",
        });
      } else if (responseData.success === true) {
        setData({
          success: responseData.success,
          name: "",
          email: "",
          password: "",
          cPassword: "",
          loading: false,
          error: {},
        });
        toast.success("Registered successfully");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStrengthText = () => {
    switch (data.passwordStrength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Register</div>
      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name">
            Name<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                name: e.target.value,
              })
            }
            value={data.name}
            type="text"
            id="name"
            className={`${
              data.error.name ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {data.error.name && <div className="text-sm text-red-500">{data.error.name}</div>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">
            Email address<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                email: e.target.value,
              })
            }
            value={data.email}
            type="email"
            id="email"
            className={`${
              data.error.email ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {data.error.email && <div className="text-sm text-red-500">{data.error.email}</div>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">
            Password<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={handlePasswordChange}
            value={data.password}
            type="password"
            id="password"
            className={`${
              data.error.password ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          <div>Password Strength: {getStrengthText()}</div>
          {data.error.password && <div className="text-sm text-red-500">{data.error.password}</div>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="cPassword">
            Confirm password
            <span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                cPassword: e.target.value,
              })
            }
            value={data.cPassword}
            type="password"
            id="cPassword"
            className={`${
              data.error.cPassword ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {data.error.cPassword && <div className="text-sm text-red-500">{data.error.cPassword}</div>}
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <input
              type="checkbox"
              id="rememberMe"
              className="px-4 py-2 focus:outline-none border mr-1"
            />
            <label htmlFor="rememberMe">
              Remember me<span className="text-sm text-gray-600">*</span>
            </label>
          </div>
          <a className="block text-gray-600" href="/">
            Lost your password?
          </a>
        </div>
        <div
          onClick={handleSubmit}
          style={{ background: "#303031" }}
          className="px-4 py-2 text-white text-center cursor-pointer font-medium"
        >
          Create an account
        </div>
      </form>
    </Fragment>
  );
};

export default Signup;
