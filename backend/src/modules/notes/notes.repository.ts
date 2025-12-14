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
        isDeleted: false, // Default to not showing deleted
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
        userId,
        isDeleted: false,
      },
    });
    return note ? new Note(note) : null;
  }

  async update(userId: string, id: string, data: any): Promise<Note> {
    // We implicitly verify ownership by adding userId to the where clause
    // However, Prisma update many/first syntax is different.
    // For safety, we rely on the service to check existence or use updateMany for bulk safety,
    // but update is standard for ID based. 
    // Best practice: Check existence first or handle error, but to keep it atomic:
    // We simply try to update where ID and UserID match.
    
    // Since Prisma `update` requires a unique selector (id), we can't add userId there directly
    // unless we use a composite ID or `updateMany`.
    // Strategy: We use `findFirst` in Service to ensure ownership, then `update` here.
    
    const note = await (this.prisma as any).note.update({
      where: { id },
      data,
    });
    return new Note(note);
  }

  async softDelete(userId: string, id: string): Promise<Note> {
    return (this.prisma as any).note.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}