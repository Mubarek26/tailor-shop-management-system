module.exports = {
  '/measurements/{orderId}': {
    get: {
      tags: ['Measurements'],
      summary: 'Get measurements by order id',
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Measurements found' } },
    },
  },
  '/measurements': {
  },
  '/measurements/{id}': {
    put: {
      tags: ['Measurements'],
      summary: 'Update measurements by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
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
                vest_chest: { type: 'number' }
              },
              example: {
                coat_length: 45,
                coat_waist: 32,
                coat_chest: 40,
                coat_shoulder: 17,
                pant_length: 41,
                pant_waist: 32,
                pant_hip: 38,
                pant_thigh: 22,
                pant_bottom: 16,
                vest_length: 20,
                vest_waist: 32,
                vest_chest: 38
              }
            }
          }
        },
      },
      responses: { '200': { description: 'Measurements updated' } },
    },
  },
};