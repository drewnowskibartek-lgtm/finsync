import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
export declare class AiController {
    private ai;
    constructor(ai: AiService);
    chat(user: {
        userId: string;
    }, dto: ChatDto): Promise<{
        reply: any;
    }>;
    report(user: {
        userId: string;
    }): Promise<{
        reply: any;
    }>;
    parseReceipt(user: {
        userId: string;
    }, file?: Express.Multer.File): Promise<{
        data: {
            data?: string;
            kwota?: number;
            waluta?: string;
            odbiorca?: string;
            metoda?: string;
            notatka?: string;
            confidence?: {
                data?: number;
                kwota?: number;
                waluta?: number;
                odbiorca?: number;
                metoda?: number;
                notatka?: number;
            };
        };
    }>;
}
