
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesDto } from './dto/list-notes.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(private notesRepository: NotesRepository) {}

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    // Basic creating logic. 
    // Future Hook: Emit 'note.created' event for indexing
    return this.notesRepository.create(userId, {
      title: dto.title || 'Untitled',
      content: dto.content || {},
    });
  }

  async findAll(userId: string, dto: ListNotesDto): Promise<Note[]> {
    const { page = 1, limit = 20, isArchived, search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        // Note: Searching JSON content is database specific and expensive.
        // We skip generic JSON search for MVP.
      ];
    }

    return this.notesRepository.findMany(userId, {
      skip,
      take: limit,
      where,
    });
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.notesRepository.findOne(userId, id);
    if (!note) {
      throw new NotFoundException(`Note not found`);
    }
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto): Promise<Note> {
    // 1. Check existence & ownership
    const existing = await this.findOne(userId, id);

    // 2. Perform Update
    // Note: We are NOT creating a version on every update to support fast autosave.
    // Versions should be triggered explicitly or via a debounced background job.
    return this.notesRepository.update(userId, id, {
      ...dto,
      updatedAt: new Date(), // Explicitly update timestamp
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    // 1. Check existence
    await this.findOne(userId, id);
    
    // 2. Soft delete
    await this.notesRepository.softDelete(userId, id);
  }
}
