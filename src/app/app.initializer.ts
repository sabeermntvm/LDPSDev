import { AuthService } from './-service/auth.service';
export function appInitializer(authenService: AuthService) {
    return () => new Promise(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        authenService.refreshToken()
            .subscribe()
            .add(resolve);
    });
}