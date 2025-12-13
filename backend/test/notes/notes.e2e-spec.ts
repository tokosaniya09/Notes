import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { cleanDatabase } from '../utils/test-utils';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeAll: any;
declare const beforeEach: any;
declare const afterAll: any;

describe('NotesModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    // Register a user to get token
    const res = await (request(app.getHttpServer()) as any)
      .post('/auth/register')
      .send({ email: 'notes@test.com', password: 'password123', firstName: 'Notes' });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/notes (POST)', () => {
    it('should create a note', () => {
      return (request(app.getHttpServer()) as any)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Integration Note', content: { text: 'Testing' } })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('Integration Note');
        });
    });
  });

  describe('/notes (GET)', () => {
    it('should get list of notes', async () => {
      // Create 2 notes
      await (request(app.getHttpServer()) as any)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Note 1' });
      await (request(app.getHttpServer()) as any)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Note 2' });

      return (request(app.getHttpServer()) as any)
        .get('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
        });
    });
  });

  describe('/notes/:id (PATCH)', () => {
    it('should update a note', async () => {
      const createRes = await (request(app.getHttpServer()) as any)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Original' });
      
      const noteId = createRes.body.id;

      return (request(app.getHttpServer()) as any)
        .patch(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated');
        });
    });
  });
});