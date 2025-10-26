import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StoresService } from '../../stores/stores.service';

@Injectable()
export class StoreContextGuard implements CanActivate {
  constructor(private readonly storesService: StoresService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let storeSlug = request.params.storeSlug || request.query.storeSlug;

    if (!storeSlug) {
      console.error(
        'StoreContextGuard: storeSlug parameter missing in request params or query.',
      );
      throw new BadRequestException(
        'Store context (slug) is missing in the request URL (path or query).',
      );
    }

    // If storeSlug is an array (can happen with query params), take the first element.
    // This is a defensive check; typically, for a single query param, it's a string.
    if (Array.isArray(storeSlug)) {
      storeSlug = storeSlug[0];
    }

    try {
      const store = await this.storesService.findBySlug(storeSlug as string);
      if (!store) {
        throw new NotFoundException(
          `Store with slug "${storeSlug}" not found.`,
        );
      }
      // Attach storeSlug and storeId to the request object
      request.storeSlug = storeSlug as string; // Ensure it's a string after potential array check
      request.storeId = store.id;
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `StoreContextGuard: Error finding store for slug "${storeSlug}":`,
        error,
      );
      throw new NotFoundException(
        `Store with slug "${storeSlug}" not found or inaccessible.`,
      );
    }
  }
}
