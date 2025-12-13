import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { NotFoundException } from '@nestjs/common';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

const mockNotesRepository = {
  create: jest.fn(),
  findMany: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: NotesRepository,
          useValue: mockNotesRepository,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a note', async () => {
      const userId = 'user-1';
      const dto = { title: 'My Note', content: { text: 'Hello' } };
      mockNotesRepository.create.mockResolvedValue({ id: 'note-1', ...dto });

      const result = await service.create(userId, dto);
      expect(result.id).toBe('note-1');
      expect(mockNotesRepository.create).toHaveBeenCalledWith(userId, expect.objectContaining(dto));
    });
  });

  describe('findAll', () => {
    it('should return an array of notes', async () => {
      mockNotesRepository.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('user-1', {});
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a note if it exists', async () => {
      mockNotesRepository.findOne.mockResolvedValue({ id: 'note-1', userId: 'user-1' });
      mockNotesRepository.update.mockResolvedValue({ id: 'note-1', title: 'Updated' });

      const result = await service.update('user-1', 'note-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockNotesRepository.findOne.mockResolvedValue(null);

      await expect(service.update('user-1', 'note-99', {})).rejects.toThrow(NotFoundException);
    });
  });
});