import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between } from 'typeorm';
import { StoreEntity } from '../stores/entities/store.entity';
import { OrderEntity, OrderStatus } from '../orders/entities/order.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ReportErrorDto } from './dto/report-error.dto';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private productVariantRepository: Repository<ProductVariantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getDashboardData(storeSlug: string) {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const storeId = store.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Calculate Total Sales for the store
    const salesResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalSales')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    const totalSales = parseFloat(salesResult?.totalSales) || 0;

    // Count Orders Today for the store
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Count Orders Today for the store using QueryBuilder
    const ordersTodayCount = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.storeId = :storeId', { storeId }) // Filter by store
      .andWhere('"order"."orderDate" >= :startOfToday', { startOfToday: today }) // Filter by date (start of today)
      .andWhere('"order"."orderDate" <= :endOfToday', {
        endOfToday: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }) // Filter by date (end of today)
      .getCount(); // Use getCount() for the count

    // Count Low Stock Items for the store
    // This requires checking both products (if no variants) and product variants
    const lowStockThreshold = 10; // Define a threshold for low stock

    // Count low stock products without variants
    // Count low stock products without variants using QueryBuilder
    const lowStockProductsCount = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant') // Left join with variants
      .where('product.storeId = :storeId', { storeId }) // Filter by store
      .andWhere('product.stockLevel < :threshold', {
        threshold: lowStockThreshold,
      }) // Filter by stock level
      .andWhere('variant.id IS NULL') // Filter where variant ID is null (no variants)
      .getCount();

    // Count low stock product variants
    const lowStockVariantsCount = await this.productVariantRepository.count({
      where: {
        product: { store: { id: storeId } }, // Filter variants by product's store
        stockLevel: LessThan(lowStockThreshold),
      },
    });

    const lowStockItems = lowStockProductsCount + lowStockVariantsCount;

    // Placeholder for Sales Chart Data (requires more complex aggregation)
    const salesChartData = [
      /* real data based on period */
    ]; // TODO: Implement real sales chart data fetching

    // Placeholder for Inventory Alerts (requires more detailed logic)
    const inventoryAlerts = [
      /* real alerts */
    ]; // TODO: Implement real inventory alerts

    // Placeholder for Store Health Score (requires various metrics)
    const storeHealthScore = 0; // TODO: Implement real store health score calculation

    return {
      totalSales,
      ordersToday: ordersTodayCount,
      lowStockItems,
      salesChartData, // Currently empty placeholder
      recentOrders: [], // Return empty array for now, recent orders handled by separate endpoint
      inventoryAlerts, // Currently empty placeholder
      storeHealthScore, // Currently 0
    };
  }

  async getRecentOrders(
    storeSlug: string,
    page: number,
    limit: number,
    sortColumn: string = 'orderDate', // Change default to orderDate
    sortDirection: 'asc' | 'desc',
  ) {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const storeId = store.id;
    const skip = (page - 1) * limit;

    // Fetch recent orders with user relation for customer name
    const order: any = {};
    if (sortColumn === 'createdAt' || sortColumn === 'date') {
      order.orderDate = sortDirection;
    } else {
      // It's safer to only allow sorting on known properties to prevent injection issues
      // For now, we'll allow any column name passed from the frontend, but this should be reviewed.
      // A better approach would be to have a whitelist of sortable columns.
      order[sortColumn] = sortDirection;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { store: { id: storeId } },
      relations: ['user'], // Load the related user entity
      order: order, // Apply sorting using the constructed order object
      skip: skip, // Apply pagination skip
      take: limit, // Apply pagination limit
    });

    // Map orders to a simpler structure if needed, or return entities directly
    // For now, return entities directly. Frontend can map.

    return {
      data: orders,
      total,
      page,
      limit,
    };
  }

  async getSalesChartData(storeSlug: string, period: string): Promise<any> {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const storeId = store.id;

    const deliveredOrders = await this.orderRepository.find({
      where: {
        store: { id: storeId },
        status: OrderStatus.DELIVERED,
      },
      order: { orderDate: 'ASC' }, // Order by date for time series data
    });

    // Implement aggregation logic based on 'period' (daily, weekly, monthly, all)
    const salesData: { [key: string]: number } = {};
    const labels: string[] = [];

    deliveredOrders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      let key: string;
      let label: string;

      switch (period) {
        case 'daily':
          key = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
          label = key; // Use date as label for now
          break;
        case 'weekly':
          // TODO: Implement proper weekly aggregation logic (e.g., ISO week)
          // For now, group by the start of the week (Sunday)
          const startOfWeek = new Date(orderDate);
          startOfWeek.setDate(orderDate.getDate() - orderDate.getDay());
          key = startOfWeek.toISOString().split('T')[0];
          label = `Week of ${key}`;
          break;
        case 'monthly':
          key = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`; // YYYY-MM
          label = orderDate.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          }); // e.g., 'Jan 2023'
          break;
        case 'all':
        default:
          key = 'all';
          label = 'All Time';
          break;
      }

      if (!salesData[key]) {
        salesData[key] = 0;
      }
      salesData[key] += order.totalAmount;

      if (!labels.includes(label) && period !== 'all') {
        labels.push(label);
      }
    });

    // Sort labels chronologically for daily, weekly, monthly
    if (period !== 'all') {
      labels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else {
      labels.push('All Time'); // Add 'All Time' label for the single data point
    }

    const datasets = [
      {
        data: labels.map((label) => {
          if (period === 'all') {
            return salesData['all'] || 0;
          }
          // Find the corresponding key for the label (reverse mapping for daily/weekly/monthly)
          const key =
            deliveredOrders
              .find((order) => {
                const orderDate = new Date(order.orderDate);
                if (
                  period === 'daily' &&
                  orderDate.toISOString().split('T')[0] === label
                )
                  return true;
                if (
                  period === 'monthly' &&
                  orderDate.toLocaleString('default', {
                    month: 'short',
                    year: 'numeric',
                  }) === label
                )
                  return true;
                // TODO: Add weekly key mapping
                return false;
              })
              ?.orderDate.toISOString()
              .split('T')[0] || label; // Fallback to label if key not found (might need refinement)

          return salesData[key] || 0;
        }),
        label: 'Total Sales',
        borderColor: '#28A745', // Primary Accent Green
        backgroundColor: 'rgba(40, 167, 69, 0.2)', // Subtle green fill
      },
      // Add dataset for comparison period if needed
    ];

    // Refine data extraction for labels and datasets
    const aggregatedData = Object.entries(salesData).map(([key, total]) => ({
      key,
      total,
    }));

    // Sort aggregated data by key (date/month/etc.)
    aggregatedData.sort((a, b) => {
      if (period === 'daily' || period === 'weekly' || period === 'monthly') {
        return new Date(a.key).getTime() - new Date(b.key).getTime();
      }
      return 0; // No specific sort for 'all'
    });

    const finalLabels = aggregatedData.map((item) => {
      if (period === 'daily') return item.key;
      if (period === 'monthly') {
        const [year, month] = item.key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
          'default',
          { month: 'short', year: 'numeric' },
        );
      }
      // TODO: Add weekly label formatting
      return item.key; // Fallback
    });

    const finalDataset = {
      data: aggregatedData.map((item) => item.total),
      label: 'Total Sales',
      borderColor: '#28A745',
      backgroundColor: 'rgba(40, 167, 69, 0.2)',
    };

    return {
      labels: finalLabels,
      datasets: [finalDataset],
    };
  }

  async getInventoryAlerts(storeSlug: string): Promise<any[]> {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const storeId = store.id;
    const lowStockThreshold = 10; // Consistent with dashboard data calculation

    // Find low stock products without variants
    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .where('product.storeId = :storeId', { storeId })
      .andWhere('product.stockLevel < :threshold', {
        threshold: lowStockThreshold,
      })
      .andWhere('variant.id IS NULL')
      .select(['product.sku', 'product.name', 'product.stockLevel'])
      .getMany();

    // Find low stock product variants
    const lowStockVariants = await this.productVariantRepository.find({
      where: {
        product: { store: { id: storeId } },
        stockLevel: LessThan(lowStockThreshold),
      },
      relations: ['product'], // Load product to get name/SKU
      select: ['sku', 'stockLevel', 'product'], // Select variant fields and product relation
    });

    // Format alerts
    const alerts: any[] = [];

    lowStockProducts.forEach((p) => {
      alerts.push({
        type: 'Low Stock',
        sku: p.sku,
        name: p.name,
        stock: p.stockLevel,
        message: `Product "${p.name}" (SKU: ${p.sku}) is low in stock (${p.stockLevel}).`,
      });
    });

    lowStockVariants.forEach((v) => {
      alerts.push({
        type: 'Low Stock Variant',
        sku: v.sku,
        name: `${v.product.name} - ${v.options.map((opt) => opt.value).join('/')}`, // Include variant options in name
        stock: v.stockLevel,
        message: `Product variant "${v.product.name}" (${v.options.map((opt) => opt.value).join('/')}, SKU: ${v.sku}) is low in stock (${v.stockLevel}).`,
      });
    });

    return alerts;
  }

  async reportErrorForManager(reportErrorDto: ReportErrorDto): Promise<void> {
    console.log('Error reported:', reportErrorDto);
    // Placeholder for actual error reporting logic (e.g., sending to a logging service)
    return;
  }
}
