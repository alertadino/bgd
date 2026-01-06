module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "18",
        },
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-transform-typescript",
    "@babel/plugin-transform-private-methods",
    "@babel/plugin-transform-class-properties",
    ["module-resolver", {
      alias: {
        "@types": "./src/main/types",
        "@util": "./src/main/util",
        "@const": "./src/main/const",
        "@lib": "./src/main/lib",
        "@core": "./src/main/core",
        "@infra": "./src/main/infra",
        "@models": "./src/main/models",
        "@modules": "./src/main/modules",
        "@repository": "./src/main/repository",
        "@domain": "./src/main/domain",
      },
    }],
  ],
};
