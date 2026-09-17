import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Andes Docs — Public API",
      version: "1.0.0",
      description: [
        "API REST para consultar el estado y las URLs de descarga de documentos",
        "generados y firmados electrónicamente en Andes Docs.",
        "",
        "**Autenticación:** por API key. Cada empresa recibe una clave única que",
        "se envía en el header `x-api-key`. La clave determina automáticamente",
        "la empresa asociada; no es necesario enviar `companyId` en la request.",
        "",
        "**Scope por rol del usuario consultado:**",
        "- `admin` / `admin-editor`: ve todos los documentos de la empresa.",
        "- `supervisor`: ve los propios y los de sus usuarios supervisados.",
        "- `user` / `user-editor`: ve solo los documentos que creó.",
        "",
        "**Soporte:** contactar a Andes Docs para renovación de claves o soporte técnico.",
      ].join("\n"),
      contact: {
        name: "Andes Docs",
        url: "https://andesdocs.com",
      },
    },
    servers: [
      {
        url: "https://f-achaval.onrender.com/public-api/v1",
        description: "Producción",
      },
      {
        url: "http://localhost:8080/public-api/v1",
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description:
            "Clave API asignada a la empresa. Se solicita a Andes Docs y debe mantenerse secreta.",
        },
      },
      schemas: {
        Document: {
          type: "object",
          required: [
            "id",
            "fileName",
            "documentKind",
            "status",
            "createdAt",
            "signedAt",
            "downloadUrl",
            "creatorEmail",
          ],
          properties: {
            id: {
              type: "string",
              description: "Identificador único de la firma en Andes Docs.",
              example: "1735689600000",
            },
            fileName: {
              type: "string",
              nullable: true,
              description: "Nombre del archivo original enviado a firma.",
              example: "Reserva Depto Palermo.pdf",
            },
            documentKind: {
              type: "string",
              nullable: true,
              description:
                "Tipo de documento según la clasificación interna del emisor (ej: 'Reserva', 'Autorización').",
              example: "Reserva",
            },
            status: {
              type: "string",
              enum: ["pending", "signed"],
              description:
                "Estado actual del documento. `pending` = pendiente de firma; `signed` = firmado por al menos un firmante.",
              example: "signed",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Fecha ISO 8601 en que se solicitó la firma.",
              example: "2025-09-01T12:00:00.000Z",
            },
            signedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description:
                "Fecha ISO 8601 en que se completó la firma. `null` si aún está pendiente.",
              example: "2025-09-03T18:22:00.000Z",
            },
            downloadUrl: {
              type: "string",
              format: "uri",
              nullable: true,
              description:
                "URL para descargar el PDF firmado. `null` si el documento aún no fue firmado. La URL abre directamente en navegador y permite descarga.",
              example:
                "https://zapsign-cdn.example/signed/documento-firmado.pdf",
            },
            creatorEmail: {
              type: "string",
              format: "email",
              nullable: true,
              description: "Email del usuario de Andes Docs que solicitó la firma.",
              example: "usuario@empresa.com",
            },
          },
        },
        User: {
          type: "object",
          required: ["userId", "email", "role"],
          properties: {
            userId: {
              type: "string",
              description: "ID interno del usuario en Andes Docs.",
              example: "auth0|abc123def456",
            },
            email: {
              type: "string",
              format: "email",
              example: "usuario@empresa.com",
            },
            role: {
              type: "string",
              enum: ["admin", "admin-editor", "supervisor", "user", "user-editor"],
              description:
                "Rol del usuario en Andes Docs. Determina el scope de los documentos devueltos.",
              example: "user",
            },
          },
        },
        ListDocumentsResponse: {
          type: "object",
          required: ["user", "data", "nextCursor"],
          properties: {
            user: { $ref: "#/components/schemas/User" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Document" },
            },
            nextCursor: {
              type: "string",
              nullable: true,
              description:
                "Cursor de paginación (reservado). Actualmente siempre `null`; usar `limit` para acotar resultados.",
              example: null,
            },
          },
        },
        ErrorObject: {
          type: "object",
          required: ["code", "message"],
          properties: {
            code: { type: "string", example: "INVALID_API_KEY" },
            message: { type: "string", example: "Invalid API key" },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["error"],
          properties: {
            error: { $ref: "#/components/schemas/ErrorObject" },
            details: {
              type: "array",
              description:
                "Presente solo en errores 400 de validación. Contiene detalles de cada campo inválido.",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", example: "field" },
                  value: { type: "string", nullable: true },
                  msg: { type: "string", example: "email is required" },
                  path: { type: "string", example: "email" },
                  location: { type: "string", example: "query" },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "API key ausente o inválida.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missing: {
                  summary: "Header x-api-key ausente",
                  value: {
                    error: {
                      code: "MISSING_API_KEY",
                      message: "x-api-key header is required",
                    },
                  },
                },
                invalid: {
                  summary: "API key no reconocida",
                  value: {
                    error: {
                      code: "INVALID_API_KEY",
                      message: "Invalid API key",
                    },
                  },
                },
              },
            },
          },
        },
        BadRequest: {
          description: "Parámetros de query inválidos.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missingEmail: {
                  summary: "Falta el parámetro email",
                  value: {
                    error: {
                      code: "INVALID_QUERY",
                      message: "One or more query parameters are invalid",
                    },
                    details: [
                      {
                        type: "field",
                        msg: "email is required",
                        path: "email",
                        location: "query",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description:
            "El email indicado no está registrado como usuario de Andes Docs para la empresa asociada a la API key.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: {
                  code: "USER_NOT_FOUND",
                  message:
                    "The provided email is not registered for this company",
                },
              },
            },
          },
        },
        InternalError: {
          description: "Error interno del servidor.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    tags: [
      {
        name: "Documents",
        description: "Consulta de documentos firmados y pendientes de firma.",
      },
    ],
    paths: {
      "/documents": {
        get: {
          tags: ["Documents"],
          summary: "Listar documentos por email",
          description: [
            "Devuelve los documentos de firma electrónica asociados al `email`",
            "indicado, dentro de la empresa vinculada a la API key.",
            "",
            "El scope de resultados depende del rol del usuario consultado",
            "(ver descripción general de la API).",
            "",
            "El campo `downloadUrl` provee el link para abrir/descargar el PDF firmado.",
            "Cuando el documento aún está `pending`, `downloadUrl` y `signedAt` son `null`.",
          ].join("\n"),
          parameters: [
            {
              in: "query",
              name: "email",
              required: true,
              schema: { type: "string", format: "email" },
              description:
                "Email del usuario de Andes Docs cuyos documentos se quieren consultar.",
              example: "usuario@empresa.com",
            },
            {
              in: "query",
              name: "status",
              required: false,
              schema: {
                type: "string",
                enum: ["pending", "signed", "all"],
                default: "all",
              },
              description:
                "Filtra por estado del documento. `all` (default) devuelve todos.",
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
              description:
                "Cantidad máxima de resultados a devolver (entre 1 y 200).",
            },
          ],
          responses: {
            "200": {
              description: "Listado de documentos.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ListDocumentsResponse" },
                  example: {
                    user: {
                      userId: "auth0|abc123def456",
                      email: "usuario@empresa.com",
                      role: "user",
                    },
                    data: [
                      {
                        id: "1735689600000",
                        fileName: "Reserva Depto Palermo.pdf",
                        documentKind: "Reserva",
                        status: "signed",
                        createdAt: "2025-09-01T12:00:00.000Z",
                        signedAt: "2025-09-03T18:22:00.000Z",
                        downloadUrl:
                          "https://zapsign-cdn.example/signed/documento-firmado.pdf",
                        creatorEmail: "usuario@empresa.com",
                      },
                      {
                        id: "1735776000000",
                        fileName: "Autorización Depto Recoleta.pdf",
                        documentKind: "Autorización",
                        status: "pending",
                        createdAt: "2025-09-02T10:15:00.000Z",
                        signedAt: null,
                        downloadUrl: null,
                        creatorEmail: "usuario@empresa.com",
                      },
                    ],
                    nextCursor: null,
                  },
                },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "500": { $ref: "#/components/responses/InternalError" },
          },
        },
      },
    },
  },
  apis: [],
};

const publicApiSwaggerSpec = swaggerJsdoc(options);

export { swaggerUi, publicApiSwaggerSpec };
