import { Controller, Get } from '@nestjs/common';
import {
    ClientProxy,
    Client,
    Transport,
    MessagePattern,
    EventPattern,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('math')
export class MathController {
    @Client({ transport: Transport.TCP, options: { port: 4000 } })
    client: ClientProxy;

    @Get('sum')
    call(): Observable<number> {
        const pattern = { cmd: 'sum' };
        const data = [1, 2, 3, 4, 5];
        this.client.emit("hello","hello from microservice")
        return this.client.send<number>(pattern, data);
    }

    @MessagePattern({ cmd: 'sum' })
    sum(data: number[]): number {
        return (data || []).reduce((a, b) => a + b);
    }
}
