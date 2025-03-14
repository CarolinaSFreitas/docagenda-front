import { api, requestConfig } from "../utils/config";

const register = async (data) => {
  const config = requestConfig("POST", data);

  try {
    const res = await fetch(api + "/users/register", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.setItem("user", JSON.stringify(res));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};
const registerAssistente = async (data) => {
  const config = requestConfig("POST", data);

  try {
    const res = await fetch(api + "/assistente/register", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...res, isAssistente: true })
      );
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const logout = () => {
  localStorage.removeItem("user");
};

const login = async (data) => {
  const config = requestConfig("POST", data);

  try {
    const res = await fetch(api + "/users/login", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.setItem("user", JSON.stringify(res));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const authService = {
  register,
  registerAssistente,
  logout,
  login,
};

export default authService;
