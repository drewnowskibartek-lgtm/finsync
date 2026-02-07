import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    me(user: {
        userId: string;
    }): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }>;
}
