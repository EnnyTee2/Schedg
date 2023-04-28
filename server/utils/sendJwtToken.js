// Create user token and save in cookie
const sendJwtToken = (user, statusCode, res) => {

    // Create user token using Schema method
    const token = user.getJwtToken()

    // Create token options
    const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    path: "/",
  };

  // send response   
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
  });

}

export default sendJwtToken