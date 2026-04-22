import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  JueriCategory,
  JueriPaginated,
  JueriProduct,
  JueriSubcategory,
} from './jueri.types';

@Injectable()
export class JueriHttpService {
  private readonly logger = new Logger(JueriHttpService.name);
  private readonly client: AxiosInstance;

  constructor() {
    const token = process.env.JUERI_API_TOKEN;
    const clientId = process.env.JUERI_CLIENTE_SISTEMA_ID;

    if (!token || !clientId) {
      throw new Error('JUERI_API_TOKEN and JUERI_CLIENTE_SISTEMA_ID are required');
    }

    this.client = axios.create({
      baseURL: `https://jueri.com.br/sis/api/v1/${clientId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 20000,
    });

    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        this.logger.error(
          `[jueri] ${error.response?.status ?? 'ERR'} ${error.config?.url} — ${error.message}`,
        );
        return Promise.reject(error);
      },
    );
  }

  async listProductsPage(page: number, perPage = 200): Promise<JueriPaginated<JueriProduct>> {
    const { data } = await this.client.get<JueriPaginated<JueriProduct>>('/produto', {
      params: { page, per_page: perPage, status: 1 },
    });
    return data;
  }

  async listAllProducts(): Promise<JueriProduct[]> {
    const all: JueriProduct[] = [];
    let page = 1;

    while (true) {
      const result = await this.listProductsPage(page);
      all.push(...result.data);
      this.logger.log(`[jueri] products page ${page} — ${result.data.length} items (total so far: ${all.length})`);
      if (!result.next_page_url) break;
      page++;
    }

    return all;
  }

  async listCategories(): Promise<JueriCategory[]> {
    const { data } = await this.client.get<JueriPaginated<JueriCategory>>('/produto/categoria', {
      params: { per_page: 500 },
    });
    return data.data;
  }

  async listSubcategories(): Promise<JueriSubcategory[]> {
    const { data } = await this.client.get<JueriPaginated<JueriSubcategory>>('/produto/subcategoria', {
      params: { per_page: 500 },
    });
    return data.data;
  }
}
