import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto, PetResponseDto, UpdatePetDto, QueryPetsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PetsController {
    constructor(private readonly petsService: PetsService) {
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new pet' })
    @ApiResponse({
        status: 400,
        description: 'Bad request'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    async create(
        @CurrentUser() user: any,
        @Body(ValidationPipe) createPetDto: CreatePetDto,
    ): Promise<PetResponseDto> {
        return this.petsService.create(user.id, createPetDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user pets with pagination, sorting and search' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    async findAll(
        @CurrentUser() user: any,
        @Query(ValidationPipe) query: QueryPetsDto,
    ): Promise<PaginatedResponseDto<PetResponseDto>> {
        return this.petsService.findAll(user.id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get pet by ID' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    @ApiResponse({
        status: 404,
        description: 'Pet not found'
    })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ): Promise<PetResponseDto> {
        return this.petsService.findOne(id, user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update pet details' })
    @ApiResponse({
        status: 400,
        description: 'Bad request'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    @ApiResponse({
        status: 404,
        description: 'Pet not found'
    })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body(ValidationPipe) updatePetDto: UpdatePetDto,
    ): Promise<PetResponseDto> {
        return this.petsService.update(id, user.id, updatePetDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete pet' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    @ApiResponse({
        status: 404,
        description: 'Pet not found'
    })
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ): Promise<void> {
        return this.petsService.remove(id, user.id);
    }
}