import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCodeEntity } from './entities/promo-code.entity';

@Injectable()
export class PromoCodesService {
    constructor(
        @InjectRepository(PromoCodeEntity)
        private readonly promoCodeRepository: Repository<PromoCodeEntity>,
    ) { }

    async findByCode(code: string): Promise<PromoCodeEntity | undefined> {
        const promoCode = await this.promoCodeRepository.findOne({ where: { code } });
        return promoCode ?? undefined;
    }

    async create(promoCodeData: Partial<PromoCodeEntity>): Promise<PromoCodeEntity> {
        const promoCode = this.promoCodeRepository.create(promoCodeData);
        return this.promoCodeRepository.save(promoCode);
    }

    async findAll(): Promise<PromoCodeEntity[]> {
        return this.promoCodeRepository.find();
    }

    async findOne(id: string): Promise<PromoCodeEntity | undefined> {
        const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
        return promoCode ?? undefined;
    }

    async update(id: string, promoCodeData: Partial<PromoCodeEntity>): Promise<PromoCodeEntity | undefined> {
        await this.promoCodeRepository.update(id, promoCodeData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.promoCodeRepository.delete(id);
    }
}