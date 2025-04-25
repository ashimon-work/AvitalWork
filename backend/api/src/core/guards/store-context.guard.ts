import { Injectable, CanActivate, ExecutionContext, NotFoundException, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StoresService } from '../../stores/stores.service'; // Import StoresService

@Injectable()
export class StoreContextGuard implements CanActivate {
  constructor(private readonly storesService: StoresService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const storeSlug = request.params.storeSlug; // Assuming slug is in URL params

    if (!storeSlug) {
      // This guard assumes the slug is part of the URL.
      // If not, alternative logic (e.g., header, query param) would be needed.
      console.error('StoreContextGuard: storeSlug parameter missing in request params.');
      throw new BadRequestException('Store context (slug) is missing in the request URL.');
    }

    try {
      const store = await this.storesService.findBySlug(storeSlug); // Corrected method name
      if (!store) {
        throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
      }
      // Attach storeId to the request object
      request.storeId = store.id;
      return true; // Allow access
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      console.error(`StoreContextGuard: Error finding store for slug "${storeSlug}":`, error);
      throw new NotFoundException(`Store with slug "${storeSlug}" not found or inaccessible.`);
    }
  }
}