import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // הפונקציה הזו מוודאת שאם אין Token או שה-Token לא תקין, 
  // הבקשה לא תיחסם, פשוט req.user יהיה ריק.
  handleRequest(err, user, info) {
    return user || null;
  }
}