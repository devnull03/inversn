const fs = require("fs");
const https = require("https");
const { EOL } = require("os");
const path = require("path");
const crypto = require("crypto");

class SimpleLogger {
  disableLogging = false;
  // @ts-ignore
  constructor(logFilePath) {
    this.disableLogging = false;
    // @ts-ignore
    if (SimpleLogger.instance !== undefined) {
      // @ts-ignore
      return SimpleLogger.instance;
    }
    const dirname = path.dirname(logFilePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    this.logFilePath = logFilePath;
    // @ts-ignore
    SimpleLogger.instance = this;
    // @ts-ignore
    return SimpleLogger.instance;
  }

  // @ts-ignore
  log(level, apiTag, paymentRequestId, message, value) {
    const timestamp = this.formatDateTime(Date.now());
    let valueStr = value;
    if (typeof value === "object") {
      valueStr = JSON.stringify(value);
    }
    const logMessage = `${timestamp} [${level.toUpperCase()}] apiTag=${apiTag}, paymentRequestId=${paymentRequestId}, message=${message}, value=${valueStr}${EOL}`;
    fs.appendFile(this.logFilePath, logMessage, () => {});
  }

  // @ts-ignore
  info(apiTag, paymentRequestId, message, value) {
    this.log("info", apiTag, paymentRequestId, message, value);
  }

  // @ts-ignore
  error(apiTag, paymentRequestId, message, value) {
    this.log("error", apiTag, paymentRequestId, message, value);
  }

  // @ts-ignore
  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${month} ${day}, ${year} ${hour}:${minute}:${second} ${period}`;
  }
}

/**
 * Singleton class
 */
class PaymentHandler {
  /**
   * use this as it facilitates with some basic error handling
   */
  // @ts-ignore
  static getInstance(userSpecifiedConfigPath) {
    return new PaymentHandler(userSpecifiedConfigPath);
  }

  // @ts-ignore
  constructor(userSpecifiedConfigPath) {
    // @ts-ignore
    if (PaymentHandler.paymentHandlerInstance !== undefined)
      // @ts-ignore
      return PaymentHandler.paymentHandlerInstance;
    this.paymentConfigs = undefined;
    const configPath = userSpecifiedConfigPath || "config.json";
    try {
      const config = fs.readFileSync(configPath, "utf-8");
      this.paymentConfigs = JSON.parse(config);
    } catch (error) {
      console.error(
        "Failed to read configs from file, here's tbe error message:- " +
          // @ts-ignore
          error.message
      );
      throw new TypeError("Failed to find/read config file");
    }
    this.validatePaymentConfigs();
    this.logger = new SimpleLogger(this.getLoggingPath());
    this.logger.disableLogging = !this.getEnableLogging();
    // @ts-ignore
    PaymentHandler.paymentHandlerInstance = this;
    // @ts-ignore
    return PaymentHandler.paymentHandlerInstance;
  }

  // @ts-ignore
  orderSession(params) {
    this.validateParams(params);
    return this.makeServiceCall({
      apiTag: "ORDER_SESSION",
      method: "POST",
      path: "/session",
      body: {
        payment_page_client_id: this.getPaymentPageClientId(),
        ...params,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // @ts-ignore
  orderStatus(params) {
    let orderId = undefined;
    if (typeof params === "string") {
      orderId = params;
    } else {
      this.validateParams(params);
      orderId = params["order_id"];
    }
    if (orderId === undefined) {
      throw new APIException(
        -1,
        "INVALID_PARAMS",
        "INVALID_PARAMS",
        "order_id is missing, usage:- orderStatus('order_id') or orderStatus({'order_id': 'value', ...other configs here})"
      );
    }
    return this.makeServiceCall({
      apiTag: "ORDER_STATUS",
      method: "GET",
      path: `/orders/${orderId}`,
      body: params,
    });
  }

  // @ts-ignore
  refund(params) {
    this.validateParams(params);
    return this.makeServiceCall({
      apiTag: "ORDER_REFUND",
      method: "POST",
      path: `/refunds`,
      body: params,
    });
  }

  // utility functions
  // @ts-ignore
  makeServiceCall({ apiTag, path, method, headers = {}, query = {}, body }) {
    return new Promise((resolve, reject) => {
      const paymentRequestId = this.generateUUID();
      headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `NODEJS_KIT/1.0.0`,
        version: this.getVersion(),
        "x-merchantid": this.getMerchantId(),
        ...headers,
        Authorization: "Basic " + this.base64EncodeKey(this.getApiKey()),
      };

      const payload = this.prepareData(body, headers);
      const encodedQueryParams = this.prepareData(query);
      const pathWithQueryParams =
        path +
        (encodedQueryParams.length === 0 ? "" : `?${encodedQueryParams}`);

      // @ts-ignore
      this.logger.info(apiTag, paymentRequestId, "Request parameters", payload);

      const fullPath = new URL(pathWithQueryParams, this.getBaseUrl()),
        agent = new https.Agent({ keepAlive: true });

      // @ts-ignore
      this.logger.info(
        apiTag,
        paymentRequestId,
        "Executing request",
        fullPath.pathname + fullPath.search
      );

      const httpOptions = {
        host: fullPath.host,
        port: fullPath.port,
        path: fullPath.pathname + fullPath.search,
        method,
        agent,
        headers,
      };

      const req = https.request(httpOptions);

      req.setTimeout(100000, () => {
        // @ts-ignore
        this.logger.log(apiTag, paymentRequestId, {
          message: "Request has been timedout",
        });
        req.destroy(
          new APIException(
            -1,
            "REQUEST_TIMEOUT",
            "REQUEST_TIMEOUT",
            "Request has been timedout"
          )
        );
      });

      req.on("response", (res) => {
        res.setEncoding("utf-8");
        // @ts-ignore
        this.logger.info(
          apiTag,
          paymentRequestId,
          "Received Http Response Code",
          res.statusCode
        );

        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.once("end", () => {
          // @ts-ignore
          this.logger.info(
            apiTag,
            paymentRequestId,
            "Received Response",
            responseBody
          );
          let resJson = undefined;
          try {
            resJson = JSON.parse(responseBody);
          } catch (e) {
            // in sdk we only accept json response
            // @ts-ignore
            this.logger.error(
              apiTag,
              paymentRequestId,
              "INVALID_RESPONSE_FORMAT",
              e
            );
            return reject(
              new APIException(
                res.statusCode,
                "INVALID_RESPONSE",
                "INVALID_RESPONSE",
                responseBody || "Failed to parse response json"
              )
            );
          }

          // @ts-ignore
          if (res.statusCode >= 200 && res.statusCode < 300) {
            return resolve(resJson);
          } else {
            let status = resJson["status"],
              errorCode = resJson["error_code"],
              errorMessage = resJson["error_message"];
            return reject(
              new APIException(res.statusCode, status, errorCode, errorMessage)
            );
          }
        });
      });

      req.once("socket", (socket) => {
        if (socket.connecting) {
          socket.once("secureConnect", () => {
            req.write(payload);
            req.end();
          });
        } else {
          req.write(payload);
          req.end();
        }
      });

      req.on("error", (error) => {
        // @ts-ignore
        this.logger.error(
          apiTag,
          paymentRequestId,
          "Please check your internet connection/Failed to establish connection",
          error
        );
        return reject(error);
      });
    });
  }

  // @ts-ignore
  validateParams(params) {
    if (typeof params != "object")
      throw new APIException(
        -1,
        "INVALID_PARAMS",
        "INVALID_PARAMS",
        "Params are empty or non an object"
      );
  }

  validatePaymentConfigs() {
    const nonNullConfigs = [
      "MERCHANT_ID",
      "API_KEY",
      "PAYMENT_PAGE_CLIENT_ID",
      "BASE_URL",
      "ENABLE_LOGGING",
      "LOGGING_PATH",
      "RESPONSE_KEY",
    ];
    for (let key of nonNullConfigs) {
      if (!(key in this.paymentConfigs)) {
        console.error(key + " not present in config.");
        throw new TypeError(key + " not present in config.");
      }
    }
  }

  // @ts-ignore
  prepareData(data, headers) {
    if (data === undefined) return "";
    if (typeof data != "object") return String(data);
    if (
      headers !== undefined &&
      headers["Content-Type"] === "application/json"
    ) {
      return JSON.stringify(data);
    }
    return Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
      )
      .join("&");
  }

  // @ts-ignore
  base64EncodeKey(str) {
    return Buffer.from(str).toString("base64");
  }

  generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // helpers getters and setters
  getMerchantId() {
    return this.paymentConfigs.MERCHANT_ID;
  }

  getBaseUrl() {
    return this.paymentConfigs.BASE_URL;
  }

  getApiKey() {
    return this.paymentConfigs.API_KEY;
  }

  getPaymentPageClientId() {
    return this.paymentConfigs.PAYMENT_PAGE_CLIENT_ID;
  }

  getEnableLogging() {
    return typeof this.paymentConfigs.ENABLE_LOGGING == "boolean"
      ? !this.paymentConfigs.ENABLE_LOGGING
      : true;
  }

  getLoggingPath() {
    return (
      this.paymentConfigs.LOGGING_PATH ||
      path.join(__dirname, "logs/paymentHandler.log")
    );
  }

  getResponseKey() {
    return this.paymentConfigs.RESPONSE_KEY;
  }

  getVersion() {
    // @ts-ignore
    return this.version || "2024-06-24";
  }
}

class APIException extends Error {
  status = undefined;
  errorCode = undefined;
  errorMessage = undefined;
  httpResponseCode = undefined;

  // @ts-ignore
  constructor(httpResponseCode, status, errorCode, errorMessage) {
    super(errorMessage || errorCode || "Something went wrong");
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.httpResponseCode = httpResponseCode;
  }
}

// @ts-ignore
function validateHMAC_SHA256(params, secretKey) {
  if (typeof params !== "object" || typeof secretKey !== "string") {
    throw new TypeError(
      "params should be object, given ",
      typeof params,
      // @ts-ignore
      ", secretKey should be string, given ",
      typeof secretKey
    );
  }

  // @ts-ignore
  var paramsList = [];
  for (var key in params) {
    if (key != "signature" && key != "signature_algorithm") {
      // @ts-ignore
      paramsList[key] = params[key];
    }
  }

  // @ts-ignore
  paramsList = sortObjectByKeys(paramsList);

  var paramsString = "";
  for (var key in paramsList) {
    paramsString = paramsString + key + "=" + paramsList[key] + "&";
  }

  let encodedParams = encodeURIComponent(
    paramsString.substring(0, paramsString.length - 1)
  );
  let computedHmac = crypto
    .createHmac("sha256", secretKey)
    .update(encodedParams)
    .digest("base64");
  let receivedHmac = decodeURIComponent(params.signature);

  return decodeURIComponent(computedHmac) == receivedHmac;
}

// @ts-ignore
function sortObjectByKeys(o) {
  return Object.keys(o)
    .sort()
    // @ts-ignore
    .reduce((r, k) => ((r[k] = o[k]), r), {});
}

module.exports = {
  PaymentHandler,
  SimpleLogger,
  APIException,
  validateHMAC_SHA256,
};
