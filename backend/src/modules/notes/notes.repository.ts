import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesRepository {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any): Promise<Note> {
    const note = await (this.prisma as any).note.create({
      data: {
        ...data,
        isShared: false,
        user: { connect: { id: userId } },
      },
    });
    return new Note(note);
  }

  async findMany(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      where?: any;
      orderBy?: any;
    },
  ): Promise<Note[]> {
    const notes = await (this.prisma as any).note.findMany({
      where: {
        ...params.where,
        userId,
        isDeleted: false,
      },
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy || { updatedAt: 'desc' },
    });
    return notes.map((n) => new Note(n));
  }

  async findOne(userId: string, id: string): Promise<Note | null> {
    const note = await (this.prisma as any).note.findFirst({
      where: {
        id,
        isDeleted: false,
        OR: [
          { userId },
          { isShared: true } // Allow access if note is shared
        ]
      },
    });
    return note ? new Note(note) : null;
  }

  async update(userId: string, id: string, data: any): Promise<Note> {
    // We assume permission check (findOne) is done by Service before calling update,
    // or we implicitly trust the operation if the ID matches.
    // However, for extra safety in a direct call, we should ensure the note exists and is accessible.
    // But since `update` throws if not found in Prisma when using `update` with `where: id`, 
    // it will just work if the ID is valid. 
    // The Service layer handles the logic of "Can this user edit this note?".
    
    const note = await (this.prisma as any).note.update({
      where: { id },
      data,
    });
    return new Note(note);
  }

  async softDelete(userId: string, id: string): Promise<Note> {
    // Only owner should delete. We enforce userId here.
    const note = await (this.prisma as any).note.findFirst({
        where: { id, userId }
    });
    
    if (!note) {
        throw new Error("Note not found or unauthorized");
    }

    return (this.prisma as any).note.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
