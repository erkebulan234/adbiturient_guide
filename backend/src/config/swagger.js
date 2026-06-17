const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Навигатор абитуриента API',
      version: '1.0.0',
      description: 'REST API для платформы подбора образовательных программ Казахстана'
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:    { type: 'integer' },
            name:  { type: 'string' },
            email: { type: 'string', format: 'email' },
            role:  { type: 'string', enum: ['user', 'admin'] }
          }
        },
        Profile: {
          type: 'object',
          properties: {
            id:              { type: 'integer' },
            user_id:         { type: 'integer' },
            education_level: { type: 'string', enum: ['grade_9', 'grade_11'] },
            city:            { type: 'string' },
            interests:       { type: 'array', items: { type: 'string' } },
            subjects:        { type: 'array', items: { type: 'string' } },
            skills:          { type: 'array', items: { type: 'string' } },
            career_goals:    { type: 'string' },
            ent_score:       { type: 'integer', minimum: 0, maximum: 140 }
          }
        },
        Institution: {
          type: 'object',
          properties: {
            id:          { type: 'integer' },
            name:        { type: 'string' },
            type:        { type: 'string', enum: ['college', 'university'] },
            city:        { type: 'string' },
            address:     { type: 'string' },
            website:     { type: 'string' },
            description: { type: 'string' }
          }
        },
        Specialty: {
          type: 'object',
          properties: {
            id:                { type: 'integer' },
            title:             { type: 'string' },
            code:              { type: 'string' },
            education_level:   { type: 'string', enum: ['grade_9', 'grade_11'] },
            profession:        { type: 'string' },
            description:       { type: 'string' },
            required_subjects: { type: 'array', items: { type: 'string' } },
            required_skills:   { type: 'array', items: { type: 'string' } },
            average_salary:    { type: 'string' },
            demand_level:      { type: 'string' },
            tags:              { type: 'array', items: { type: 'string' } }
          }
        },
        Program: {
          type: 'object',
          properties: {
            id:                 { type: 'integer' },
            institution_id:     { type: 'integer' },
            specialty_id:       { type: 'integer' },
            tuition_fee:        { type: 'integer' },
            duration_years:     { type: 'integer' },
            study_language:     { type: 'string' },
            study_form:         { type: 'string' },
            required_documents: { type: 'array', items: { type: 'string' } },
            min_score:          { type: 'integer' },
            has_grant:          { type: 'boolean' }
          }
        },
        Recommendation: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            score:            { type: 'integer' },
            match_percent:    { type: 'integer' },
            reason:           { type: 'string' },
            title:            { type: 'string' },
            profession:       { type: 'string' },
            institution_name: { type: 'string' },
            institution_type: { type: 'string' },
            institution_city: { type: 'string' },
            tuition_fee:      { type: 'integer' },
            has_grant:        { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',            description: 'Аутентификация' },
      { name: 'Profile',         description: 'Профиль абитуриента' },
      { name: 'Institutions',    description: 'Учебные заведения' },
      { name: 'Specialties',     description: 'Специальности' },
      { name: 'Programs',        description: 'Образовательные программы' },
      { name: 'Test',            description: 'Профориентационный тест' },
      { name: 'Recommendations', description: 'Рекомендации' },
      { name: 'Favorites',       description: 'Избранное' },
      { name: 'Admin',           description: 'Администрирование' }
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Регистрация',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    name:     { type: 'string', example: 'Алия' },
                    email:    { type: 'string', example: 'aliya@mail.kz' },
                    password: { type: 'string', minLength: 6, example: 'secret123' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Успешная регистрация',
              content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } }
            },
            400: { description: 'Пользователь уже существует', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Вход',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', example: 'aliya@mail.kz' },
                    password: { type: 'string', example: 'secret123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Успешный вход',
              content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } }
            },
            401: { description: 'Неверные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/profile': {
        get: {
          tags: ['Profile'],
          summary: 'Получить профиль',
          responses: {
            200: { description: 'Профиль пользователя', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } }
          }
        },
        post: {
          tags: ['Profile'],
          summary: 'Сохранить профиль',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    educationLevel: { type: 'string', enum: ['grade_9', 'grade_11'] },
                    city:           { type: 'string', example: 'Алматы' },
                    interests:      { type: 'array', items: { type: 'string' }, example: ['IT', 'математика'] },
                    subjects:       { type: 'array', items: { type: 'string' }, example: ['информатика'] },
                    skills:         { type: 'array', items: { type: 'string' }, example: ['логика'] },
                    careerGoals:    { type: 'string', example: 'Хочу стать программистом' },
                    entScore:       { type: 'integer', minimum: 0, maximum: 140, example: 95 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Анкета сохранена' }
          }
        }
      },
      '/api/institutions': {
        get: {
          tags: ['Institutions'],
          summary: 'Список учебных заведений',
          security: [],
          parameters: [
            { name: 'type',   in: 'query', schema: { type: 'string', enum: ['college', 'university'] } },
            { name: 'city',   in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Список заведений', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Institution' } } } } }
          }
        }
      },
      '/api/specialties': {
        get: {
          tags: ['Specialties'],
          summary: 'Список специальностей',
          security: [],
          parameters: [
            { name: 'educationLevel', in: 'query', schema: { type: 'string', enum: ['grade_9', 'grade_11'] } },
            { name: 'search',         in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Список специальностей', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Specialty' } } } } }
          }
        }
      },
      '/api/programs': {
        get: {
          tags: ['Programs'],
          summary: 'Список программ с фильтрами',
          security: [],
          parameters: [
            { name: 'educationLevel',  in: 'query', schema: { type: 'string' } },
            { name: 'institutionType', in: 'query', schema: { type: 'string' } },
            { name: 'city',            in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Список программ', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Program' } } } } }
          }
        }
      },
      '/api/test': {
        get: {
          tags: ['Test'],
          summary: 'Список тестов',
          responses: { 200: { description: 'Список тестов' } }
        }
      },
      '/api/test/{id}': {
        get: {
          tags: ['Test'],
          summary: 'Тест с вопросами',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Тест и вопросы' },
            404: { description: 'Тест не найден' }
          }
        }
      },
      '/api/test/{id}/submit': {
        post: {
          tags: ['Test'],
          summary: 'Отправить ответы',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    answers: { type: 'array', items: { type: 'integer' }, example: [1, 5, 9, 12] }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Тест завершён' } }
        }
      },
      '/api/test/results': {
        get: {
          tags: ['Test'],
          summary: 'История результатов теста',
          responses: { 200: { description: 'Результаты' } }
        }
      },
      '/api/recommendations': {
        get: {
          tags: ['Recommendations'],
          summary: 'Получить рекомендации',
          responses: {
            200: { description: 'Список рекомендаций', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Recommendation' } } } } }
          }
        }
      },
      '/api/recommendations/generate': {
        post: {
          tags: ['Recommendations'],
          summary: 'Сгенерировать рекомендации',
          responses: {
            200: { description: 'Рекомендации сформированы' },
            400: { description: 'Анкета не заполнена' }
          }
        }
      },
      '/api/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'Список избранных программ',
          responses: { 200: { description: 'Избранные программы' } }
        }
      },
      '/api/favorites/ids': {
        get: {
          tags: ['Favorites'],
          summary: 'ID избранных программ',
          responses: {
            200: { description: 'Массив ID', content: { 'application/json': { schema: { type: 'array', items: { type: 'integer' } } } } }
          }
        }
      },
      '/api/favorites/{programId}': {
        post: {
          tags: ['Favorites'],
          summary: 'Добавить в избранное',
          parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Добавлено' } }
        },
        delete: {
          tags: ['Favorites'],
          summary: 'Убрать из избранного',
          parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Удалено' } }
        }
      },
      '/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Статистика системы',
          responses: { 200: { description: 'Статистика' } }
        }
      },
      '/admin/institutions': {
        post: {
          tags: ['Admin'],
          summary: 'Добавить учебное заведение',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Institution' } } } },
          responses: { 201: { description: 'Создано' } }
        }
      },
      '/admin/institutions/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Обновить учебное заведение',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Institution' } } } },
          responses: { 200: { description: 'Обновлено' } }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Удалить учебное заведение',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Удалено' } }
        }
      },
      '/admin/specialties': {
        post: {
          tags: ['Admin'],
          summary: 'Добавить специальность',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Specialty' } } } },
          responses: { 201: { description: 'Создано' } }
        }
      },
      '/admin/specialties/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Обновить специальность',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Specialty' } } } },
          responses: { 200: { description: 'Обновлено' } }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Удалить специальность',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Удалено' } }
        }
      },
      '/admin/programs': {
        post: {
          tags: ['Admin'],
          summary: 'Добавить программу',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Program' } } } },
          responses: { 201: { description: 'Создано' } }
        }
      },
      '/admin/programs/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Обновить программу',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Program' } } } },
          responses: { 200: { description: 'Обновлено' } }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Удалить программу',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Удалено' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
