import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param, ParseIntPipe,
    Post,
    Put,
    Query, Res, UploadedFile, UseInterceptors,
    UsePipes
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody, ApiConsumes,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import {MovieService} from './movie.service';
import {CreateMovieDto} from "./dto/create-movie.dto";
import {Movie} from "./models/movie.model";
import {UpdateMovieDto} from "./dto/update-movie.dto";
import {ApiNoContentResponse} from "@nestjs/swagger/dist/decorators/api-response.decorator";
import {movieConfig} from "./config/movie.config";
import {LimitValidationPipe} from "@app/pipes/limit-validation.pipe";
import {ADMIN_ROLE, JwtAuthGuard} from "@app/auth-shared/session/guards/jwt.guard";
import { SharedModule } from "@app/shared";
import { MovieNotFoundException } from "./common/movie-not-found-exception";
import { FilterMovieDto } from "./dto/filter-movie.dto";
import { TrailerNotFoundException } from "./common/trailer-not-found-exception";
import { Trailer } from "./models/trailer.model";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('Фильмы')
@Controller('movies')
export class MovieController {
    constructor(private readonly movieService: MovieService) {
    }

    @Get('/random')
    @UsePipes(new LimitValidationPipe(
      movieConfig.MOVIE_LIST_LIMIT.minLimit,
      movieConfig.MOVIE_LIST_LIMIT.maxLimit))
    @ApiOperation({summary: 'Получить случайный фильм из БД'})
    @ApiOkResponse({
        description: 'Случайный фильм найден',
        type: [Movie]
    })
    @ApiQuery({name: 'limit', required: true, type: Number, description: 'Количество случайных фильмов'})
    async findRandom(@Query('limit', ParseIntPipe) limit: number): Promise<Movie[]> {
        return await this.movieService.findRandom(limit);
    }

    @Get('/best')
    @UsePipes(new LimitValidationPipe(
      movieConfig.MOVIE_LIST_LIMIT.minLimit,
      movieConfig.MOVIE_LIST_LIMIT.maxLimit))
    @ApiOperation({summary: 'Список лучших фильмов'})
    @ApiOkResponse({
        description: 'Получен список фильмов',
        type: [Movie]
    })
    @ApiQuery({name: 'limit', required: false, type: Number, description: 'Количество возвращенных фильмов'})
    @ApiQuery({name: 'offset', required: false, type: Number, description: 'Количество пропускаемых фильмов'})
    async getBestMovies(
      @Query('limit', ParseIntPipe) limit: number,
      @Query('offset',ParseIntPipe) offset: number): Promise<Movie[]>
    {
        return await this.movieService.getBestMovies(limit, offset);
    }

    @Get('/:id')
    @ApiOperation({summary: 'Поиск по id'})
    @ApiOkResponse({
        description: 'Фильм найден',
        type: Movie
    })
    @ApiNotFoundResponse({
        description: 'Фильм не найден',
        type: SharedModule.generateDocsByHttpException(new MovieNotFoundException())
    })
    @ApiParam({name: 'id', required: true, type: Number, description: 'Идентификатор фильма'})
    async findOne(@Param('id') id: number): Promise<Movie> {
        const movie: Movie = await this.movieService.findOne(id);
        if (!movie)
            throw new MovieNotFoundException();
        return movie;
    }

    @Get()
    @UsePipes(new LimitValidationPipe(
        movieConfig.MOVIE_LIST_LIMIT.minLimit,
        movieConfig.MOVIE_LIST_LIMIT.maxLimit))
    @ApiOperation({summary: 'Получить список фильмов'})
    @ApiOkResponse({
        description: 'Получен список фильмов',
        type: [Movie]
    })
    @ApiQuery({name: 'limit', required: false, type: Number, description: 'Количество возвращенных фильмов'})
    @ApiQuery({name: 'offset', required: false, type: Number, description: 'Количество пропускаемых фильмов'})
    async getMovies(@Query() filterParams: FilterMovieDto,
                    @Query('limit') limit: number,
                    @Query('offset') offset: number)
      : Promise<Movie[]> {
        return await this.movieService.getMovies(filterParams, limit, offset);
    }

    @Post()
    @JwtAuthGuard(ADMIN_ROLE)
    @ApiOperation({summary: 'Создать фильм', description: "Требуется роль: admin"})
    @ApiCreatedResponse({
        description: 'Новый фильм успешно создан',
        type: Movie
    })
    @ApiBearerAuth()
    async create(@Body() data: CreateMovieDto): Promise<Movie> {
        return await this.movieService.create(data);
    }

    @Put('/:id')
    @JwtAuthGuard(ADMIN_ROLE)
    @ApiOperation({summary: 'Изменить данные фильма', description: "Требуется роль: admin"})
    @ApiOkResponse({
        description: 'Данные фильма изменены',
        type: Movie
    })
    @ApiNotFoundResponse({
        description: 'Фильм не найден',
        type: SharedModule.generateDocsByHttpException(new MovieNotFoundException())
    })
    @ApiParam({name: 'id', required: true, type: Number, description: 'Идентификатор фильма'})
    @ApiBody({required: true, type: UpdateMovieDto, description: 'Новые данные фильма'})
    @ApiBearerAuth()
    async update(@Param('id') id: number, @Body() data: UpdateMovieDto): Promise<Movie> {
        const movie: Movie = await this.movieService.update(id, data);
        if (!movie)
            throw new NotFoundException('Фильм не найден');
        return movie;
    }

    @Delete('/:id')
    @HttpCode(204)
    @JwtAuthGuard(ADMIN_ROLE)
    @ApiOperation({summary: 'Удалить фильм', description: "Требуется роль: admin"})
    @ApiNoContentResponse({description: 'Фильм удален'})
    @ApiNotFoundResponse({
        description: 'Фильм не найден',
        type: SharedModule.generateDocsByHttpException(new MovieNotFoundException())
    })
    @ApiParam({name: 'id', required: true, type: Number, description: 'Идентификатор фильма'})
    @ApiBearerAuth()
    async delete(@Param('id') id: number): Promise<void> {
        const result: boolean = await this.movieService.delete(id);
        if (!result)
            throw new MovieNotFoundException();
    }

    @Post('/:movieId/trailers')
    @UseInterceptors(FileInterceptor('file'))
    @JwtAuthGuard(ADMIN_ROLE)
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Создать трейлер', description: "Требуется роль: admin"})
    @ApiCreatedResponse({
        description: 'Новый трейлер успешно создан',
        type: Trailer
    })
    @ApiParam({name: 'movieId', required: true, type: Number, description: 'Идентификатор фильма'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            }
        }
    })
    @ApiBearerAuth()
    async addTrailer(@Param('movieId') id: number, @UploadedFile() file: Express.Multer.File): Promise<Trailer> {
        return await this.movieService.addTrailer(id, file);
    }

    @Get('/:movieId/trailers/:trailerId')
    @ApiConsumes('application/octet-stream')
    @ApiOperation({summary: 'Получить трейлер'})
    @ApiOkResponse({
        description: 'Трейлер получен',
        type: Trailer
    })
    @ApiNotFoundResponse({
        description: 'Трейлер не найден',
        type: SharedModule.generateDocsByHttpException(new TrailerNotFoundException())
    })
    @ApiParam({name: 'movieId', required: true, type: Number, description: 'Идентификатор фильма'})
    @ApiParam({name: 'trailerId', required: true, type: Number, description: 'Идентификатор трейлера'})
    async getTrailer(
      @Param('movieId') movieId: number,
      @Param('trailerId') trailerId: number,
      @Res() res: Response
    ): Promise<Trailer>
    {
        const trailer = await this.movieService.getTrailer(movieId, trailerId, res);
        if (!trailer)
            throw new TrailerNotFoundException();
        return trailer;
    }

    @Get('/:movieId/trailers')
    @ApiOperation({summary: 'Получить список трейлеров'})
    @ApiOkResponse({
        description: 'Трейлеры получены',
        type: [Trailer]
    })
    @ApiParam({name: 'movieId', required: true, type: Number, description: 'Идентификатор фильма'})
    async getTrailers(
      @Param('movieId') movieId: number
    ): Promise<Trailer[]>
    {
        return await this.movieService.getTrailers(movieId);
    }
}
