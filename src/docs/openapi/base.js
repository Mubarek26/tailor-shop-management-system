const tags = [
  { name: 'Auth' },
  { name: 'Users' },
  { name: 'Customers' },
  { name: 'Orders' },
  { name: 'Measurements' },
  { name: 'Designs' },
  { name: 'Payments' },
  { name: 'Tasks' },
  { name: 'Progress' },
  { name: 'Analytics' },
  { name: 'Search' },
  { name: 'Notifications' },
];

const components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  schemas: {
    ApiResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
    LoginRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        phoneNumber: { type: 'string' },
        identifier: { type: 'string' },
        password: { type: 'string' },
      },
    },
    OwnerRequestBody: {
      type: 'object',
      required: ['fullName', 'password', 'passwordConfirm', 'phoneNumber'],
      properties: {
        fullName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        passwordConfirm: { type: 'string' },
        phoneNumber: { type: 'string' },
        address: { type: 'string' },
      },
    },
    UserCreateTailorBody: {
      type: 'object',
      required: ['fullName', 'phoneNumber', 'password'],
      properties: {
        fullName: { type: 'string' },
        phoneNumber: { type: 'string' },
        password: { type: 'string' },
      },
    },
    UserStatusUpdateBody: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
      },
    },
    CreateFullOrderJson: {
      type: 'object',
      required: ['customer', 'order', 'measurements'],
      properties: {
        customer: {
          type: 'object',
          required: ['name', 'phone'],
          properties: {
            name: { type: 'string', example: 'Abebe Kebede' },
            phone: { type: 'string', example: '0912345678' },
          },
        },
        order: {
          type: 'object',
          required: ['total_price'],
          properties: {
            total_price: { type: 'number', example: 5000 },
            deposit: { type: 'number', example: 2000 },
            appointment_date: { type: 'string', format: 'date', example: '2026-05-01' },
          },
        },
        measurements: {
          type: 'object',
          properties: {
            coat_length: { type: 'number', example: 30 },
            coat_waist: { type: 'number', example: 40 },
            coat_chest: { type: 'number', example: 42 },
            coat_shoulder: { type: 'number', example: 18 },
            pant_length: { type: 'number', example: 38 },
            pant_waist: { type: 'number', example: 32 },
            pant_hip: { type: 'number', example: 40 },
            pant_thigh: { type: 'number', example: 24 },
            pant_bottom: { type: 'number', example: 16 },
            vest_length: { type: 'number', example: 25 },
            vest_waist: { type: 'number', example: 36 },
            vest_chest: { type: 'number', example: 40 },
          },
        },
      },
      example: {
        customer: {
          name: 'Abebe Kebede',
          phone: '0912345678',
        },
        order: {
          total_price: 5000,
          deposit: 2000,
          appointment_date: '2026-05-01',
        },
        measurements: {
          coat_length: 30,
          coat_waist: 40,
          coat_chest: 42,
          coat_shoulder: 18,
          pant_length: 38,
          pant_waist: 32,
          pant_hip: 40,
          pant_thigh: 24,
          pant_bottom: 16,
          vest_length: 25,
          vest_waist: 36,
          vest_chest: 40,
        },
      },
    },
    CreateFullOrderMultipart: {
      type: 'object',
      required: ['customer', 'order', 'measurements'],
      properties: {
        customer: {
          type: 'string',
          description:
            'JSON string. Example: {"name":"Abebe Kebede","phone":"0912345678"}',
        },
        order: {
          type: 'string',
          description:
              'JSON string. Example: {"total_price":5000,"deposit":2000,"appointment_date":"2026-05-01"}',
        },
        measurements: {
          type: 'string',
          description:
            'JSON string. Example: {"coat_length":30,"coat_waist":40,"coat_chest":42,"coat_shoulder":18,"pant_length":38,"pant_waist":32,"pant_hip":40,"pant_thigh":24,"pant_bottom":16,"vest_length":25,"vest_waist":36,"vest_chest":40}',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Attach an image file (jpg/png) to upload to Cloudinary. Preferred field name: image (aliases accepted by backend: file, designImage).',
        },
      },
      example: {
        customer: '{"name":"Abebe Kebede","phone":"0912345678"}',
        order: '{"total_price":5000,"deposit":2000,"appointment_date":"2026-05-01"}',
        measurements:
          '{"coat_length":30,"coat_waist":40,"coat_chest":42,"coat_shoulder":18,"pant_length":38,"pant_waist":32,"pant_hip":40,"pant_thigh":24,"pant_bottom":16,"vest_length":25,"vest_waist":36,"vest_chest":40}',
      },
    },
    UpdateOrderByOwnerJson: {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Abebe Kebede' },
            phone: { type: 'string', example: '0912345678' },
          },
        },
        order: {
          type: 'object',
          properties: {
            total_price: { type: 'number', example: 5000 },
              deposit: { type: 'number', example: 2000 },
            appointment_date: { type: 'string', format: 'date', example: '2026-05-01' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
          },
        },
        measurements: {
          type: 'object',
          properties: {
            coat_length: { type: 'number', example: 30 },
            coat_waist: { type: 'number', example: 40 },
            coat_chest: { type: 'number', example: 42 },
            coat_shoulder: { type: 'number', example: 18 },
            pant_length: { type: 'number', example: 38 },
            pant_waist: { type: 'number', example: 32 },
            pant_hip: { type: 'number', example: 40 },
            pant_thigh: { type: 'number', example: 24 },
            pant_bottom: { type: 'number', example: 16 },
            vest_length: { type: 'number', example: 25 },
            vest_waist: { type: 'number', example: 36 },
            vest_chest: { type: 'number', example: 40 },
          },
        },
      },
    },
    UpdateOrderByOwnerMultipart: {
      type: 'object',
      properties: {
        customer: {
          type: 'string',
          description: 'JSON string. Example: {"name":"Abebe Kebede","phone":"0912345678"}',
        },
        order: {
          type: 'string',
          description:
            'JSON string. Example: {"total_price":5000,"deposit":2000,"appointment_date":"2026-05-01","status":"pending"}',
        },
        measurements: {
          type: 'string',
          description:
            'JSON string. Example: {"coat_length":30,"coat_waist":40,"coat_chest":42,"coat_shoulder":18,"pant_length":38,"pant_waist":32,"pant_hip":40,"pant_thigh":24,"pant_bottom":16,"vest_length":25,"vest_waist":36,"vest_chest":40}',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Optional replacement image file.',
        },
      },
    },
    UpdateOrderStatusBody: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
      },
    },
    AssignOrderToTailorBody: {
      type: 'object',
      properties: {
        tailorId: { type: 'string', description: 'Tailor user id' },
        tailorPhone: { type: 'string', description: 'Tailor phone number (optional alternative to tailorId)' },
      },
    },
    UserSummary: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        fullName: { type: 'string' },
        phoneNumber: { type: 'string' },
        email: { type: 'string' },
        status: { type: 'string' },
      },
    },
    OwnerListResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        results: { type: 'number' },
        data: {
          type: 'object',
          properties: {
            owners: { type: 'array', items: { $ref: '#/components/schemas/UserSummary' } },
          },
        },
      },
    },
    OrderSummary: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        total_price: { type: 'number' },
        prepayment: { type: 'number' },
        remaining_price: { type: 'number' },
        appointment_date: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        design_image_url: { type: 'string' },
      },
    },
    MeasurementSummary: {
      type: 'object',
      properties: {
        coat_length: { type: 'number' },
        coat_waist: { type: 'number' },
        coat_chest: { type: 'number' },
        coat_shoulder: { type: 'number' },
        pant_length: { type: 'number' },
        pant_waist: { type: 'number' },
        pant_hip: { type: 'number' },
        pant_thigh: { type: 'number' },
        pant_bottom: { type: 'number' },
        vest_length: { type: 'number' },
        vest_waist: { type: 'number' },
        vest_chest: { type: 'number' },
      },
    },
    CustomerOrdersResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        results: { type: 'number' },
        data: {
          type: 'object',
          properties: {
            customerOrders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  order: { $ref: '#/components/schemas/OrderSummary' },
                  measurements: { $ref: '#/components/schemas/MeasurementSummary' },
                },
              },
            },
          },
        },
      },
    },
    TailorOrdersResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            orders: { type: 'array', items: { $ref: '#/components/schemas/OrderSummary' } },
          },
        },
      },
    },
    CustomerSummary: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        phone: { type: 'string' },
        unique_code: { type: 'number' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
    CustomerResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { type: 'object', properties: { customer: { $ref: '#/components/schemas/CustomerSummary' } } },
      },
    },
  },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Tailor Shop Backend API',
    version: '1.0.0',
    description: 'API documentation for all current backend endpoints.',
  },
  servers: [{ url: '/api', description: 'Local API base path' }],
  tags,
  components,
};
