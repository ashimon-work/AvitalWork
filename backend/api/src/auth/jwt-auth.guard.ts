import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Optional: Override handleRequest to customize error handling or logic after validation
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      // Log the error/info for debugging if needed
      console.error('JwtAuthGuard Error:', err || info?.message);
      throw (
        err ||
        new UnauthorizedException('Authentication token is invalid or expired.')
      );
    }
    // If authentication is successful, Passport attaches the user object to the request.
    return user; // Return the user object to be attached to req.user
  }

  // Optional: Override canActivate for more complex logic before strategy execution
  // canActivate(context: ExecutionContext) {
  //   // Add your custom authentication logic here
  //   // for example, call super.logIn(request) to establish a session.
  //   return super.canActivate(context);
  // }
}
