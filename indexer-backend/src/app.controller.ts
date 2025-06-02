import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Max, IsIn } from 'class-validator';

// Definindo o schema para o corpo da requisição
class CreateTaskRequest {
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação',
    required: true,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada da tarefa',
    example: 'Implementar sistema de autenticação usando JWT',
    required: true,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Data de vencimento em timestamp Unix (segundos)',
    example: 1777777777,
    required: true,
    type: Number
  })
  @IsNumber()
  @IsNotEmpty()
  dueDate: number;

  @ApiProperty({
    description: 'Nível de prioridade da tarefa (0-3)',
    example: 0,
    required: true,
    type: Number,
    minimum: 0,
    maximum: 3
  })
  @IsNumber()
  @Min(0)
  @Max(3)
  priority: number;

  @ApiProperty({
    description: 'Valor em wei para a tarefa',
    example: '100000',
    required: true,
    type: String,
    enum: ['100000', '50000', '10000', '1000']
  })
  @IsString()
  @IsIn(['100000', '50000', '10000', '1000'])
  value: string;
}

@ApiTags('tasks')
@Controller('tasks')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('count')
  @ApiOperation({ summary: 'Obtém o número total de tarefas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna o número total de tarefas',
    schema: {
      type: 'number',
      example: 5
    }
  })
  async getTaskCount(): Promise<number> {
    return this.appService.getTaskCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma tarefa específica' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID da tarefa',
    schema: { type: 'number' },
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os detalhes da tarefa',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Implementar autenticação' },
        description: { type: 'string', example: 'Implementar sistema de autenticação usando JWT' },
        dueDate: { type: 'number', example: 1777777777 },
        priority: { type: 'number', example: 0 },
        isCompleted: { type: 'boolean', example: false },
        owner: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async getTask(@Param('id') id: string): Promise<any> {
    try {
      return await this.appService.getTask(Number(id));
    } catch (error) {
      throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa' })
  @ApiBody({ 
    type: CreateTaskRequest,
    description: 'Dados para criar uma nova tarefa',
    examples: {
      example1: {
        value: {
          title: "Implementar autenticação",
          description: "Implementar sistema de autenticação usando JWT",
          dueDate: 1777777777,
          priority: 0,
          value: "100000"
        },
        summary: "Exemplo de criação de tarefa"
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou erro ao criar tarefa',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'A data de vencimento deve estar no futuro' }
      }
    }
  })
  async addTask(@Body() body: CreateTaskRequest): Promise<void> {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (body.dueDate <= currentTimestamp) {
        throw new HttpException(
          'A data de vencimento deve estar no futuro',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.priority > 3) {
        throw new HttpException(
          'Prioridade deve ser entre 0 e 3',
          HttpStatus.BAD_REQUEST,
        );
      }

      const validValues = ['100000', '50000', '10000', '1000'];
      if (!validValues.includes(body.value)) {
        throw new HttpException(
          'Valor inválido para a prioridade. Valores permitidos: 100000, 50000, 10000, 1000',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.appService.addTask(
        body.title,
        body.description,
        body.dueDate,
        body.priority,
        body.value,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao adicionar tarefa',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Marca uma tarefa como concluída' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID da tarefa',
    schema: { type: 'number' },
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Tarefa marcada como concluída com sucesso' })
  @ApiResponse({ 
    status: 400, 
    description: 'Erro ao completar tarefa',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Erro ao completar tarefa' }
      }
    }
  })
  async completeTask(@Param('id') id: string): Promise<void> {
    try {
      await this.appService.completeTask(Number(id));
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao completar tarefa',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as tarefas' })
  @ApiResponse({
    status: 200,
    description: 'Retorna a lista de todas as tarefas',
    isArray: true
  })
  async getTasks(): Promise<any[]> {
    return this.appService.getTasks();
  }
}