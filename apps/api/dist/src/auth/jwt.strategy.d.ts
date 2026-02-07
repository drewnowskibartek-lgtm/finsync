import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: {
        sub: string;
        email: string;
        rola: string;
    }): Promise<{
        userId: string;
        email: string;
        rola: string;
    }>;
}
export {};
