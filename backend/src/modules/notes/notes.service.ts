
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesDto } from './dto/list-notes.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(private notesRepository: NotesRepository) {}

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
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
      ];
    }

    return this.notesRepository.findMany(userId, {
      skip,
      take: limit,
      where,
    });
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.notesRepository.findOneWithPermissions(userId, id);
    if (!note) {
      throw new NotFoundException(`Note not found or access denied`);
    }
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, id);
    
    // Permission Check: Owner or Editor
    const permission = (note as any).permission;
    if (permission !== 'OWNER' && permission !== 'EDIT') {
        throw new ForbiddenException("You have View Only access to this note.");
    }

    return this.notesRepository.update(userId, id, {
      ...dto,
      updatedAt: new Date(),
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    // Only owner can delete
    const note = await this.findOne(userId, id);
    if ((note as any).permission !== 'OWNER') {
        throw new ForbiddenException("Only the owner can delete this note.");
    }
    
    await this.notesRepository.softDelete(userId, id);
  }

  // --- SHARING ---

  async shareNote(ownerId: string, noteId: string, email: string, permission: 'VIEW' | 'EDIT') {
    const note = await this.findOne(ownerId, noteId);
    if ((note as any).permission !== 'OWNER') {
        throw new ForbiddenException("Only the owner can manage access.");
    }

    // Don't share with self
    if ((note as any).owner.email === email) {
        return;
    }

    try {
        await this.notesRepository.shareWithUser(noteId, email, permission);
    } catch (e) {
        if (e.message === 'User not found') {
            throw new BadRequestException("User with this email not found.");
        }
        throw e;
    }
  }

  async revokeAccess(ownerId: string, noteId: string, targetUserId: string) {
    const note = await this.findOne(ownerId, noteId);
    if ((note as any).permission !== 'OWNER') {
        throw new ForbiddenException("Only the owner can manage access.");
    }

    await this.notesRepository.revokeShare(noteId, targetUserId);
  }

  async getCollaborators(userId: string, noteId: string) {
    const note = await this.findOne(userId, noteId);
    // Allow viewers to see who else is on the note? Yes, typical behavior.
    return this.notesRepository.getCollaborators(noteId);
  }
}
