module.exports = {
  apps: [
    {
      name: "newstrading-client",
      script: "npm run start",

      watch: false,

      env: {
        NODE_ENV: process.env.NODE_ENV,
      },
    },
  ],
};
