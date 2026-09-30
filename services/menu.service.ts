import {MenuEntity, MenuRepository} from "@/localdb/entity";

export class MenuService {
    private menuRepository: MenuRepository;

    constructor() {
        this.menuRepository = new MenuRepository();
    }

    async create(menu: any): Promise<void> {
        await this.menuRepository.add(menu);

    }
    async createAll(menus: any[]): Promise<void> {
        await this.menuRepository.addAll(menus);
    }
    async deleteAll(): Promise<void> {
        await this.menuRepository.deleteAll();
    }

    async getByTipo(tipo: string): Promise<string | null> {
        try {
            const menu = await this.menuRepository.findByNestedField('menu', 'value', tipo);
            if (menu?.menu?.label) {
                return menu.menu.label.value || menu.menu.label || null;
            }
            return null;
        } catch (error) {
            console.warn('Error al obtener menú por tipo:', error);
            return null;
        }
    }

    async getLabelByMenuValue(menuValue: string): Promise<string | null> {
        try {
            const menu = await this.menuRepository.findByFieldValue('nomenclador', menuValue);
            console.log('[MenuService] Buscando nomenclador:', menuValue, 'Encontrado:', menu);
            if (menu?.label) {
                return menu.label.value || menu.label || null;
            }
            return null;
        } catch (error) {
            console.warn('Error al obtener label por nomenclador:', error);
            return null;
        }
    }
}