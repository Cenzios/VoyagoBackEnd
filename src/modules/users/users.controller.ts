import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Create user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return {
      message: 'User created successfully',
      data,
    };
  }

  //Find user by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return {
      message: 'User found successfully',
      data,
    };
  }

  //Update user
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      data,
    };
  }

  //Delete user
  @Post(':id/delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    const data = await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
      data,
    };
  }
}
