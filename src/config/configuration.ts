export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  secret: process.env.JWT_SECRET,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
})
