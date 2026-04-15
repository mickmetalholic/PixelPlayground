import { Body, Controller, HttpException, Post } from '@nestjs/common';
import type { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';
import { LanggraphGatewayError } from './errors/langgraph-gateway.error';
import type { LanggraphGatewayService } from './langgraph-gateway.service';

@Controller('langgraph')
export class LanggraphGatewayController {
  constructor(private readonly service: LanggraphGatewayService) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      return await this.service.chat(dto);
    } catch (error) {
      if (error instanceof LanggraphGatewayError) {
        throw new HttpException(
          {
            code: error.code,
            message: error.message,
          },
          error.status,
        );
      }

      throw error;
    }
  }
}
