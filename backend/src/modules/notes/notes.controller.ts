
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesDto } from './dto/list-notes.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(user.id, createNoteDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: ListNotesDto) {
    return this.notesService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any, 
    @Param('id') id: string, 
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    return this.notesService.update(user.id, id, updateNoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.remove(user.id, id);
  }

  // --- COLLABORATION ENDPOINTS ---

  @Post(':id/share')
  async shareNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { email: string; permission: 'VIEW' | 'EDIT' }
  ) {
    await this.notesService.shareNote(user.id, id, body.email, body.permission);
    return { success: true };
  }

  @Delete(':id/share/:userId')
  async revokeShare(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string
  ) {
    await this.notesService.revokeAccess(user.id, id, targetUserId);
    return { success: true };
  }

  @Get(':id/collaborators')
  async getCollaborators(
    @CurrentUser() user: any,
    @Param('id') id: string
  ) {
    return this.notesService.getCollaborators(user.id, id);
  }
}
