const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  try {
    const expiresIn = Number(process.env.JWT_EXPIRES_IN);
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });

    return { token, expiresIn };
  } catch (error) {
    console.log(error);
  }
};

const generateRefreshToken = (id, res) => {
  try {
    const expiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN);
    const refreshToken = jwt.sign({ id: id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: expiresIn,
    });

    //Guarda token en cookies protejida
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: !(process.env.NODE_ENV === "development"),
    //   expires: new Date(Date.now() + expiresIn * 1000),
    // });

    return refreshToken;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { generateToken, generateRefreshToken };
