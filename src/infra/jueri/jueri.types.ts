export interface JueriPaginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}

export interface JueriProduct {
  id: number;
  descricao: string;
  descricao_completa?: string;
  referencia: string | null;
  numero_peca: string | null;
  fk_status_id: number;
  fk_categoria_id: number | null;
  fk_subcategoria_id: number | null;
  custo_compra_bruto: number;
  custo_banho_ouro: number;
  custo_banho_rodio: number;
  custo_banho_prata: number;
  imagem: string | null;
  quantidade: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  peso?: number;
  peso_loja?: number;
  cor?: string;
  codigo_barras?: string;
  localizacao?: string;
  observacao?: string;
  tipo_preco: Array<{ id: number; nome: string; pivot: { preco: number } }>;
  data_criacao: string;
  data_ultima_alteracao: string;
}

export interface JueriCategory {
  id: number;
  nome: string;
  fk_status_id: number;
}

export interface JueriSubcategory {
  id: number;
  nome: string;
  fk_categoria_id: number;
  fk_status_id: number;
}
