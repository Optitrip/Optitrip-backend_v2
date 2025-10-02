
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "Optitrip API",
      "version": "1.0.0",
      "description": "API documentation for Optitrip"
    },
    "servers": [
      {
        "url": "https://optitrip-backend.netlify.app/.netlify/functions/server",
        "description": "Production server"
      },
      {
        "url": "http://localhost:5000/.netlify/functions/server",
        "description": "Development server"
      }
    ],
    "paths": {
      "/users": {
        "get": {
          "summary": "Retrieve a list of users",
          "description": "Retrieve a list of users from the database",
          "responses": {
            "200": {
              "description": "A list of users",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "_id": {
                          "type": "string"
                        },
                        "user": {
                          "type": "string"
                        },
                        "name": {
                          "type": "string"
                        },
                        "email": {
                          "type": "string"
                        },
                        "password": {
                          "type": "string"
                        },
                        "phone": {
                          "type": "string"
                        },
                        "created_at": {
                          "type": "string",
                          "format": "date-time"
                        },
                        "rol_id": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {},
    "tags": []
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
