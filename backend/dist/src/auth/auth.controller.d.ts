import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            name: any;
            roleId: any;
            role: any;
        };
    }>;
    register(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            name: any;
            roleId: any;
            role: any;
        };
    } | {
        error: any;
        stack: any;
    }>;
    changePassword(req: any, body: any): Promise<{
        success: boolean;
    } | {
        error: any;
    }>;
}
