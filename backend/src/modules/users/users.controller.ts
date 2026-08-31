import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() body: {
    nama: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email: string;
    password: string;
    unit_kerja_id: number;
    role_id: number;
  }) {
    return this.usersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: {
    nama?: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email?: string;
    unit_kerja_id?: number;
    role_id?: number;
    is_active?: boolean;
  }) {
    return this.usersService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
