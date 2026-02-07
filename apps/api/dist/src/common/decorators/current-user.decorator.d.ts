export interface CurrentUser {
    userId: string;
    email: string;
    rola: 'ADMIN' | 'USER' | 'VIEWER';
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
