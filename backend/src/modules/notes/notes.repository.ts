
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesRepository {
  private readonly logger = new Logger(NotesRepository.name);

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
        isDeleted: false,
        OR: [
          { userId }, // My notes
          { shares: { some: { userId } } }, // Notes shared with me specifically
        ]
      },
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy || { updatedAt: 'desc' },
    });
    return notes.map((n) => new Note(n));
  }

  // Returns Note + Permission Context
  async findOneWithPermissions(userId: string, id: string): Promise<any | null> {
    try {
        // 1. Fetch note by ID (if not deleted)
        // We include specific shares for this user to check permissions later
        const note = await (this.prisma as any).note.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                shares: {
                    where: { userId },
                    select: { permission: true }
                },
                user: { // Include owner info
                    select: { id: true, email: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });

        if (!note) return null;

        // 2. Determine Permissions in Application Logic (More Robust)
        let permission: string | null = null;

        if (note.userId === userId) {
            permission = 'OWNER';
        } else if (note.shares && note.shares.length > 0) {
            // User has explicit shared access
            permission = note.shares[0].permission;
        } else if (note.isShared) {
            // Note is public
            permission = 'VIEW';
        }

        // 3. If no permission matches, return null (Access Denied)
        if (!permission) {
            return null;
        }

        // 4. Map to entity and attach metadata
        const mappedNote = new Note(note);
        (mappedNote as any).permission = permission;
        (mappedNote as any).owner = note.user;
        
        return mappedNote;

    } catch (error) {
        this.logger.error(`Error in findOneWithPermissions for note ${id}: ${error.message}`, error.stack);
        throw error;
    }
  }

  // Kept for backward compatibility, but redirects to above logic internally if needed
  async findOne(userId: string, id: string): Promise<Note | null> {
    return this.findOneWithPermissions(userId, id);
  }

  async update(userId: string, id: string, data: any): Promise<Note> {
    const note = await (this.prisma as any).note.update({
      where: { id },
      data,
    });
    return new Note(note);
  }

  async softDelete(userId: string, id: string): Promise<Note> {
    // Only owner should delete.
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

  // --- SHARE MANAGEMENT ---

  async shareWithUser(noteId: string, email: string, permission: 'VIEW' | 'EDIT'): Promise<void> {
    const userToShare = await (this.prisma as any).user.findUnique({
        where: { email }
    });

    if (!userToShare) {
        throw new Error('User not found');
    }

    await (this.prisma as any).sharedNote.upsert({
        where: {
            noteId_userId: {
                noteId,
                userId: userToShare.id
            }
        },
        update: { permission },
        create: {
            noteId,
            userId: userToShare.id,
            permission
        }
    });
  }

  async revokeShare(noteId: string, userId: string): Promise<void> {
    await (this.prisma as any).sharedNote.deleteMany({
        where: {
            noteId,
            userId
        }
    });
  }

  async getCollaborators(noteId: string) {
    return (this.prisma as any).sharedNote.findMany({
        where: { noteId },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true, avatar: true }
            }
        }
    });
  }
}
