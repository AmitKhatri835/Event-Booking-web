import { useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../utils/axios";

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem("userInfo");

      if (!userInfo) {
        return null;
      }

      const parsedUser = JSON.parse(userInfo);
      const normalizedUser = parsedUser?.user
        ? { ...parsedUser.user, token: parsedUser.token }
        : parsedUser;

      if (normalizedUser?.token) {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${normalizedUser.token}`;
      }

      return normalizedUser;
    } catch (error) {
      console.error("Invalid localStorage data", error);

      localStorage.removeItem("userInfo");

      return null;
    }
  });

  const saveUserData = (data) => {
    if (!data?.token) {
      throw new Error("Token missing");
    }

    const normalizedUser = data?.user
      ? { ...data.user, token: data.token }
      : data;

    setUser(normalizedUser);

    localStorage.setItem("userInfo", JSON.stringify(normalizedUser));

    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const login = async (email, password) => {
    setLoading(true);

    try {
      const { data } = await api.post("auth/login", {
        email: email.trim(),
        password,
      });

      saveUserData(data);

      return data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);

    try {
      const { data } = await api.post("auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      return data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);

    try {
      const { data } = await api.post("auth/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });

      saveUserData(data);

      return data;
    } catch (error) {
      throw error.response?.data?.message || "OTP verification failed";
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("userInfo");

    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
