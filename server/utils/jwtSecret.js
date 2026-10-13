const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.trim()) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  console.warn(
    "Warning: JWT_SECRET is missing. Using development fallback secret. Add JWT_SECRET to server/.env before final submission."
  );
  return "planz_dev_jwt_secret_change_me";
};

module.exports = { getJwtSecret };
