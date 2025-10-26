import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../product/product.service';
import { Product, ProductVariant, ProductVariantOption } from '@shared-types'; // Import variant types
import { StoreContextService } from '../../core/services/store-context.service';
import { NotificationService } from '../../core/services/notification.service';
import { T, TranslatePipe } from '@shared/i18n';

import { Subject, combineLatest, Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-product-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  providers: [ProductService],
  templateUrl: './product-management-page.component.html',
  styleUrl: './product-management-page.component.scss'
})
export class ProductManagementPageComponent implements OnInit, OnDestroy {
  public tKeys = T;

  products: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  selectedStockLevel: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10; // Products per page
  totalProducts: number = 0;
  totalPages: number = 0;

  // Sorting properties
  sortColumn: string = 'name'; // Default sort column
  sortDirection: 'asc' | 'desc' = 'asc'; // Default sort direction

  // Bulk actions properties
  selectedProductIds: string[] = [];
  selectAll: boolean = false; // For select all checkbox
  selectedBulkAction: string = ''; // To store the selected bulk action (e.g., 'delete', 'update-status')
  selectedBulkStatus: string = ''; // To store the selected status for bulk update

  editingProduct: Product | null = null;
  productFormModel: any = {};

  isLoadingExport: boolean = false;
  isLoadingImport: boolean = false; // Add loading state for import
  selectedFile: File | null = null; // Property to hold the selected file for CSV import
  showAdvancedFilters: boolean = false; // For toggling the advanced filter sidebar

  // Image uploader properties
  productImages: File[] = []; // Holds files selected for upload
  imagePreviews: (string | ArrayBuffer | null)[] = []; // Holds data URLs for previews

  // Variant management properties
  // Represents the option types being defined in the UI, e.g., [{ name: 'Color', values: 'Red,Blue' }, { name: 'Size', values: 'S,M,L' }]
  currentOptionTypes: Array<{ name: string; values: string }> = [];
  generatedVariants: ProductVariant[] = [];


  private searchTermChanged: Subject<string> = new Subject<string>();
  private filterParamsChanged: Subject<void> = new Subject<void>(); // Subject for filter/sort/pagination changes
  private subscriptions: Subscription = new Subscription(); // To manage subscriptions

  constructor(
    private productService: ProductService,
    private storeContextService: StoreContextService,
    private notificationService: NotificationService
  ) { }

  // Method to handle individual product selection
  onProductSelected(productId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (inputElement) {
      const isSelected = inputElement.checked;
      if (isSelected) {
        this.selectedProductIds.push(productId);
      } else {
        this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
      }
      // Update selectAll checkbox state
      this.selectAll = this.products.length > 0 && this.selectedProductIds.length === this.products.length;
    } else {
      console.warn('onProductSelected called with non-input event target', event);
    }
  }

  // Method to handle select all checkbox
  onSelectAllChange(): void {
    if (this.selectAll) {
      this.selectedProductIds = this.products.map(product => product.id);
    } else {
      this.selectedProductIds = [];
    }
  }

  // Method to handle bulk action selection
  onBulkActionChange(event: any): void {
    this.selectedBulkAction = event.target.value;
    // Reset selected status when action changes
    if (this.selectedBulkAction !== 'update-status') {
      this.selectedBulkStatus = '';
    }
  }

  // Method to handle bulk status selection
  onBulkStatusChange(event: any): void {
    this.selectedBulkStatus = event.target.value;
  }

  // Method to trigger the selected bulk action
  applyBulkAction(): void {
    if (this.selectedProductIds.length === 0) {
      this.notificationService.showInfo('Please select products to apply bulk action.');
      return;
    }

    switch (this.selectedBulkAction) {
      case 'delete':
        this.bulkDeleteSelectedProducts();
        break;
      case 'update-status':
        this.bulkUpdateSelectedStatus();
        break;
      // Add cases for other bulk actions here
      default:
        this.notificationService.showInfo('Please select a bulk action.');
        break;
    }
  }

  // Method to trigger bulk delete
  bulkDeleteSelectedProducts(): void {
    if (this.selectedProductIds.length === 0) {
      this.notificationService.showInfo('Please select products to delete.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedProductIds.length} selected products?`)) {
      this.productService.bulkDeleteProducts(this.selectedProductIds).subscribe({
        next: (response) => {
          // Assuming backend response includes the number of deleted items, adjust if needed
          const deletedCount = response?.deletedCount || this.selectedProductIds.length;
          this.notificationService.showSuccess(`${deletedCount} product(s) deleted successfully!`);
          this.selectedProductIds = []; // Clear selections
          this.selectAll = false; // Uncheck select all
          this.filterParamsChanged.next(); // Refresh the product list
        },
        error: (error) => {
          console.error('Error during bulk delete:', error);
          this.notificationService.showError('Failed to perform bulk delete.');
        }
      });
    }
  }

  // Method to trigger bulk status update
  bulkUpdateSelectedStatus(): void {
    if (this.selectedProductIds.length === 0) {
      this.notificationService.showInfo('Please select products to update status.');
      return;
    }

    if (!this.selectedBulkStatus) {
      this.notificationService.showInfo('Please select a status to update to.');
      return;
    }

    // Assuming 'active' and 'inactive' are the valid statuses
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(this.selectedBulkStatus)) {
      this.notificationService.showError('Invalid status selected.');
      return;
    }


    // Get the storeSlug from the service
    this.subscriptions.add(
      this.storeContextService.currentStoreSlug$.subscribe(storeSlug => {
        if (storeSlug) {
          this.productService.bulkUpdateProductStatus(this.selectedProductIds, this.selectedBulkStatus).subscribe({
            next: (response) => {
              // Assuming backend response includes the number of updated items, adjust if needed
              const updatedCount = response?.updatedCount || this.selectedProductIds.length;
              this.notificationService.showSuccess(`${updatedCount} product(s) status updated successfully!`);
              this.selectedProductIds = []; // Clear selections
              this.selectAll = false; // Uncheck select all
              this.selectedBulkAction = ''; // Reset bulk action dropdown
              this.selectedBulkStatus = ''; // Reset status dropdown
              this.filterParamsChanged.next(); // Refresh the product list
            },
            error: (error) => {
              console.error('Error during bulk status update:', error);
              this.notificationService.showError('Failed to perform bulk status update.');
            }
          });
        } else {
          this.notificationService.showError('Store context not available.');
        }
      })
    );
  }

  ngOnInit(): void {
    // Combine storeSlug changes with filter/sort/pagination changes
    const productParams$ = combineLatest([
      this.storeContextService.currentStoreSlug$.pipe(distinctUntilChanged()), // Listen for storeSlug changes
      this.searchTermChanged.pipe(debounceTime(500), distinctUntilChanged(), startWith(this.searchTerm)), // Listen for search term changes
      this.filterParamsChanged.pipe(startWith(null)) // Listen for filter/sort/pagination changes
    ]);

    this.subscriptions.add(
      productParams$.pipe(
        switchMap(([storeSlug, searchTerm, _]) => {
          if (!storeSlug) {
            // Return empty observable if storeSlug is not available
            return new Observable<{ products: Product[]; total: number }>();
          }
          // Trigger product loading when any relevant parameter changes
          return this.productService.getProducts(
            searchTerm,
            this.selectedCategory,
            this.selectedStatus,
            this.selectedStockLevel,
            this.currentPage,
            this.pageSize,
            this.sortColumn,
            this.sortDirection
          );
        })
      ).subscribe({
        next: (response: { products: Product[]; total: number }) => {
          this.products = response.products;
          this.totalProducts = response.total;
          this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          // Implement user-friendly error handling here
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onSearchTermChange(event: any): void {
    this.searchTermChanged.next(event.target.value);
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.target.value;
    this.currentPage = 1; // Reset to first page on filter change
    // No need to call filterParamsChanged.next() here if there's an "Apply Filters" button
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.currentPage = 1; // Reset to first page on filter change
    // No need to call filterParamsChanged.next() here
  }

  onStockLevelChange(event: any): void {
    this.selectedStockLevel = event.target.value;
    this.currentPage = 1; // Reset to first page on filter change
    // No need to call filterParamsChanged.next() here
  }

  applyAdvancedFilters(): void {
    this.currentPage = 1; // Reset to first page when applying filters
    this.filterParamsChanged.next();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterParamsChanged.next(); // Notify that pagination parameters have changed
    }
  }

  sortProducts(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc'; // Default to ascending when changing column
    }
    this.filterParamsChanged.next(); // Notify that sorting parameters have changed
  }

  openDuplicateProductModal(product: Product): void {
    this.editingProduct = null; // Treat as a new product
    this.productFormModel = { ...product, id: undefined, sku: undefined }; // Copy data, but clear ID and SKU for a new product
    // Implement Bootstrap modal opening logic here and populate form with duplicated product data
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
  }

  closeModal(): void {
    // Implement Bootstrap modal closing logic here
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    if (modal) {
      modal.hide();
    }
    this.editingProduct = null;
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Product deleted successfully!');
          this.filterParamsChanged.next(); // Refresh the product list
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.notificationService.showError('Failed to delete product.');
        }
      });
    }
  }

  // Method to trigger product export
  exportProducts(): void {
    this.isLoadingExport = true;
    this.productService.exportProducts().subscribe({
      next: (response: Blob) => {
        // Create a blob URL and trigger download
        const blob = new Blob([response], { type: 'text/csv' }); // Assuming CSV, adjust if needed
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // You might want to get the filename from the backend response headers (e.g., Content-Disposition)
        // For now, using a static filename
        a.download = 'products_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.notificationService.showSuccess('Product data exported successfully!');
        this.isLoadingExport = false;
      },
      error: (error) => {
        console.error('Error during product export:', error);
        this.notificationService.showError('Failed to export product data.');
        this.isLoadingExport = false;
      }
    });
  }
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
      // Optionally, trigger import immediately or show a confirmation modal
      // For now, let's assume a confirmation step is needed or a separate import button is clicked after file selection.
      // If triggering immediately, call this.importProducts();
      console.log('File selected:', this.selectedFile.name);
      // You might want to display the selected file name to the user
      this.notificationService.showInfo(`File selected: ${this.selectedFile.name}`);
    } else {
      this.selectedFile = null;
    }
  }

  importProducts(): void {
    if (!this.selectedFile) {
      this.notificationService.showInfo('Please select a file to import.');
      return;
    }

    this.isLoadingImport = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.subscriptions.add(
      this.storeContextService.currentStoreSlug$.pipe(
        switchMap(storeSlug => {
          if (!storeSlug) {
            this.notificationService.showError('Store context not available.');
            this.isLoadingImport = false;
            return new Observable<any>(); // Return empty observable to stop the chain
          }
          return this.productService.importProducts(storeSlug, formData);
        })
      ).subscribe({
        next: (response) => {
          console.log('Product import response:', response);
          // Assuming the response contains a summary like { created: 10, updated: 5, failed: 2 }
          const importSummary = response || { created: 0, updated: 0, failed: 0 };
          this.notificationService.showSuccess(`Import complete: Created ${importSummary.created}, Updated ${importSummary.updated}, Failed ${importSummary.failed}`);
          this.selectedFile = null; // Clear selected file
          // Optionally, clear the file input value as well for subsequent imports
          const fileInput = document.getElementById('productImportFile') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          this.filterParamsChanged.next(); // Refresh the product list
          this.isLoadingImport = false;
        },
        error: (error) => {
          console.error('Error during product import:', error);
          const errorMessage = error.error?.message || 'Failed to import products.';
          this.notificationService.showError(errorMessage);
          this.isLoadingImport = false;
        }
      })
    );
  }

  // Image Uploader Methods
  triggerImageFileInput(): void {
    const fileInput = document.getElementById('productImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onImageFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.handleImageFiles(element.files);
    }
    // Clear the input value to allow selecting the same file again if needed
    element.value = '';
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleImageFiles(files);
    }
    // Remove drag-over class if any
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('drag-over');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Add a class to indicate drag-over
    const dropZone = event.target as HTMLElement;
    dropZone.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Remove drag-over class
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('drag-over');
  }

  private handleImageFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.productImages.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        this.notificationService.showInfo(`File ${file.name} is not a valid image. Please upload a valid image file.`);
      }
    }
  }

  removeImagePreview(index: number): void {
    this.productImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // Placeholder for actual image upload logic within saveProduct or a dedicated method
  private async uploadProductImages(productId: string): Promise<string[]> {
    // This is a placeholder. In a real app, you would upload each file in this.productImages
    // to your backend (e.g., using ProductService) and get back the URLs.
    console.log('Uploading images for product:', productId, this.productImages);
    const uploadedImageUrls: string[] = [];

    if (this.productImages.length === 0 && this.productFormModel.imageUrls?.length > 0) {
      // No new images to upload, but existing URLs might be present
      return this.productFormModel.imageUrls;
    }
    
    // Simulate upload and get URLs
    for (const file of this.productImages) {
      // In a real scenario:
      // const response = await this.productService.uploadImage(productId, file).toPromise();
      // uploadedImageUrls.push(response.url);
      uploadedImageUrls.push(`https://via.placeholder.com/150/0000FF/808080?Text=Uploaded+${file.name}`); // Placeholder URL
    }
    
    // Combine with existing URLs if editing and not replacing all
    // For simplicity, this example replaces all URLs with newly uploaded ones.
    // A more sophisticated approach would handle adding/removing specific images.
    return uploadedImageUrls;
  }

  // Modify saveProduct to handle image uploads
  async saveProduct(): Promise<void> { // Make async to handle image upload
    // First, handle image uploads if there are any new images
    let uploadedImageUrls: string[] = this.productFormModel.imageUrls || [];
    if (this.productImages.length > 0) {
        // This is a simplified placeholder. In a real app, you'd likely upload
        // images after the product is created (to get an ID) or as part of a
        // multi-step form process. For editing, you'd need to manage existing vs new images.
        
        // For now, let's assume we get a product ID first if creating a new product.
        // This part needs to be more robust.
        // For simplicity, we'll just prepare the URLs for now.
        // Actual upload should happen via a service call.
        
        // Placeholder: Simulate getting URLs after "upload"
        // In a real app, this.uploadProductImages would make HTTP requests.
        // For this example, let's assume it returns mock URLs.
        // This logic will be more complex if you need to upload to a specific product ID.
        
        // If it's a new product, we might need to create it first, then upload images.
        // If editing, we can use existing product ID.
        // This is a conceptual placeholder for where image URL handling would go.
        // The actual upload calls would be asynchronous.
        
        // Let's assume `uploadProductImages` is called and returns the new URLs
        // This is a simplified approach. A real implementation would involve service calls.
        // For now, we'll just use the preview URLs as placeholders if no real upload is done.
        // uploadedImageUrls = await this.uploadProductImages(this.editingProduct?.id || 'new_product');
        // For demo, let's just use the imagePreviews if new images were added.
        // This is NOT how you'd do it in production. You need actual URLs from a server.
        
        // Clear existing productImages and imagePreviews after "upload"
        // this.productImages = [];
        // this.imagePreviews = [];
    }
    
    const productDataToSave = { ...this.productFormModel, imageUrls: uploadedImageUrls };

    if (this.editingProduct) {
      // Update existing product
      // Ensure productImages are handled before this call or URLs are updated in productDataToSave
      this.productService.updateProduct(this.editingProduct.id, productDataToSave).subscribe({
        next: async (response) => {
          console.log('Product updated successfully:', response);
          // If new images were selected, upload them now that we have a product
          if (this.productImages.length > 0) {
            const finalImageUrls = await this.uploadProductImages(response.id);
            // Second update call to save the image URLs if they changed
            // This is not ideal, better to have an endpoint that handles product data + images
            await this.productService.updateProduct(response.id, { ...response, imageUrls: finalImageUrls }).toPromise();
            this.productFormModel.imageUrls = finalImageUrls; // Update form model
          }
          this.closeModalAndRefresh();
          this.notificationService.showSuccess('Product updated successfully!');
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.notificationService.showError('Failed to update product.');
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(productDataToSave).subscribe({
        next: async (response) => {
          console.log('Product created successfully:', response);
          if (this.productImages.length > 0) {
             const finalImageUrls = await this.uploadProductImages(response.id);
             // Update the newly created product with image URLs
             await this.productService.updateProduct(response.id, { ...response, imageUrls: finalImageUrls }).toPromise();
             this.productFormModel.imageUrls = finalImageUrls; // Update form model
          }
          this.closeModalAndRefresh();
          this.notificationService.showSuccess('Product created successfully!');
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.notificationService.showError(error.error?.message || 'Failed to create product.');
        }
      });
    }
  }

  private closeModalAndRefresh(): void {
    this.closeModal();
    this.filterParamsChanged.next(); // Refresh the product list
    this.productImages = []; // Clear staged images
    this.imagePreviews = []; // Clear previews
  }

  // Adjust openAddProductModal and openEditProductModal to reset/load image previews
  openAddProductModal(): void {
    this.editingProduct = null;
    this.productImages = [];
    this.imagePreviews = [];
    this.productFormModel = {
      sku: '',
      name: '',
      description: '',
      price: 0,
      categoryIds: [],
      stockLevel: 0,
      imageUrls: [],
      tags: [],
      isActive: true,
      options: [],
      variants: []
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
  }

  openEditProductModal(product: Product): void {
    this.productService.getProductDetailsForManager(product.id).subscribe({
      next: (fullProductDetails: Product) => {
        this.editingProduct = fullProductDetails;
        this.productFormModel = { ...fullProductDetails };
        this.productImages = []; // Reset staged files
        this.imagePreviews = [...(fullProductDetails.imageUrls || [])]; // Show existing images as previews
        
        // Initialize currentOptionTypes from productFormModel.options and productFormModel.variants
        this.currentOptionTypes = (fullProductDetails.options || []).map(optionName => {
          // Find all unique values for this option name from the existing variants
          const values = new Set<string>();
          (fullProductDetails.variants || []).forEach(variant => {
            const opt = variant.options.find(o => o.name === optionName);
            if (opt) {
              values.add(opt.value);
            }
          });
          return { name: optionName, values: Array.from(values).join(',') };
        });
        this.generatedVariants = fullProductDetails.variants || [];


        const modal = new (window as any).bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();
      },
      error: (error) => {
        console.error('Error fetching product details for edit:', error);
        this.notificationService.showError('Failed to load product details for editing.');
      }
    });
  }

  // Variant Management Methods
  addOptionType(): void {
    this.currentOptionTypes.push({ name: '', values: '' });
  }

  removeOptionType(index: number): void {
    this.currentOptionTypes.splice(index, 1);
    this.generateVariants(); // Regenerate variants when an option type is removed
  }

  // Call this when option type name or values string changes
  onOptionTypeChange(): void {
    // This can be used to trigger validation or live updates if needed,
    // but primary generation happens via generateVariants button or automatically.
    // For now, we rely on the "Generate Variants" button.
  }

  generateVariants(): void {
    if (this.currentOptionTypes.some(ot => !ot.name.trim() || !ot.values.trim())) {
      this.notificationService.showInfo('Please ensure all option types have a name and comma-separated values.');
      return;
    }

    const optionArrays = this.currentOptionTypes.map(ot => ({
      name: ot.name.trim(),
      values: ot.values.split(',').map(v => v.trim()).filter(v => v)
    })).filter(ot => ot.values.length > 0); // Ensure there are values to process

    if (optionArrays.length === 0) {
      this.generatedVariants = [];
      this.productFormModel.options = [];
      this.productFormModel.variants = [];
      return;
    }
    
    this.productFormModel.options = optionArrays.map(oa => oa.name);

    const newVariants: ProductVariant[] = [];
    const existingVariantsMap = new Map<string, ProductVariant>();
    (this.productFormModel.variants || []).forEach((v: ProductVariant) => { // Add type to v
        const key = v.options.map((o: ProductVariantOption) => `${o.name}:${o.value}`).sort().join('|'); // Add type to o
        existingVariantsMap.set(key, v);
    });


    const generateCombinations = (index: number, currentCombination: ProductVariantOption[]) => {
      if (index === optionArrays.length) {
        // Combination complete
        const variantKey = currentCombination.map(o => `${o.name}:${o.value}`).sort().join('|');
        const existingVariant = existingVariantsMap.get(variantKey);

        newVariants.push({
          id: existingVariant?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Keep existing ID or generate temp
          sku: existingVariant?.sku || '', // Keep existing SKU or default
          options: [...currentCombination],
          price: existingVariant?.price !== undefined ? existingVariant.price : this.productFormModel.price, // Keep existing or default to base
          stockLevel: existingVariant?.stockLevel || 0, // Keep existing or default
          imageUrl: existingVariant?.imageUrl || undefined, // Keep existing
        });
        return;
      }

      const currentOptionType = optionArrays[index];
      for (const value of currentOptionType.values) {
        currentCombination.push({ name: currentOptionType.name, value: value });
        generateCombinations(index + 1, currentCombination);
        currentCombination.pop(); // Backtrack
      }
    };

    generateCombinations(0, []);
    this.generatedVariants = newVariants;
    this.productFormModel.variants = [...this.generatedVariants]; // Update the form model
  }
  
  // Helper to update a specific field in a generated variant
  updateVariantDetail(variantIndex: number, field: keyof ProductVariant, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value: string | number = inputElement.value;
    if (field === 'price' || field === 'stockLevel') {
      value = parseFloat(inputElement.value);
      if (isNaN(value)) value = 0; // Default to 0 if parse fails
    }
    
    if (this.generatedVariants[variantIndex]) {
      (this.generatedVariants[variantIndex] as any)[field] = value;
      // Also update the productFormModel.variants to ensure data consistency
      const variantInFormModel = this.productFormModel.variants.find((v: ProductVariant) =>
        this.areVariantOptionsEqual(v.options, this.generatedVariants[variantIndex].options)
      );
      if (variantInFormModel) {
        (variantInFormModel as any)[field] = value;
      } else {
        // This case should ideally not happen if generatedVariants is the source of truth for the UI
        console.warn('Variant not found in productFormModel for update:', this.generatedVariants[variantIndex]);
      }
    }
  }

  // Helper to compare two arrays of ProductVariantOption (order-agnostic)
  private areVariantOptionsEqual(optionsA: ProductVariantOption[], optionsB: ProductVariantOption[]): boolean {
    if (optionsA.length !== optionsB.length) return false;
    const keyA = optionsA.map(o => `${o.name}:${o.value}`).sort().join('|');
    const keyB = optionsB.map(o => `${o.name}:${o.value}`).sort().join('|');
    return keyA === keyB;
  }

  // Ensure this is the only definition of openAddProductModal
}