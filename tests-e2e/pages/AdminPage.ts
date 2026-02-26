import { Page, expect } from '@playwright/test';

export class AdminPage {
    constructor(private page: Page) { }

    async login(user: string, pass: string) {
        await this.page.goto('http://localhost:3000/login');
        await this.page.locator('input[type="email"]').fill(user);
        await this.page.locator('input[type="password"]').fill(pass);
        await this.page.locator('button:has-text("Entrar")').click();
    }

    async goToOrders() {
        await this.page.locator('a:has-text("Pedidos")').click();
    }

    async verifyLastOrderAuthorized() {
        const lastOrder = this.page.locator('tr').first();
        await expect(lastOrder.locator('text=AUTORIZADA')).toBeVisible();
    }

    async downloadNFe() {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.locator('button[title="Baixar NF-e"]').first().click();
        return await downloadPromise;
    }
}
