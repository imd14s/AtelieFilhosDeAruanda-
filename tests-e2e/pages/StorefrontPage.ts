import { Page, expect } from '@playwright/test';

export class StorefrontPage {
    constructor(private page: Page) { }

    async goto() {
        await this.page.goto('http://localhost:5173');
    }

    async searchProduct(name: string) {
        const searchInput = this.page.locator('input[placeholder*="Buscar"]');
        await searchInput.fill(name);
        await searchInput.press('Enter');
    }

    async addFirstProductToCart() {
        // Assumindo que existe um botão de compra nos cards
        const firstProduct = this.page.locator('button:has-text("Comprar"), button:has-text("Adicionar ao Carrinho")').first();
        await firstProduct.click();
    }

    async openCart() {
        await this.page.locator('button[aria-label*="Carrinho"]').click();
    }

    async goToCheckout() {
        await this.page.locator('button:has-text("Finalizar Compra")').click();
    }
}
