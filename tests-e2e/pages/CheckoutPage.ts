import { Page, expect } from '@playwright/test';

export class CheckoutPage {
    constructor(private page: Page) { }

    async fillFiscalData(name: string, doc: string, email: string) {
        await this.page.locator('input[name="fullName"]').fill(name);
        await this.page.locator('input[name="document"]').fill(doc);
        await this.page.locator('input[name="email"]').fill(email);
    }

    async fillAddress(zip: string, number: string) {
        await this.page.locator('input[name="zipCode"]').fill(zip);
        // Aguarda preenchimento automático via correios se existir
        await this.page.locator('input[name="number"]').fill(number);
    }

    async selectPaymentMethod(method: 'PIX' | 'CREDIT_CARD') {
        await this.page.locator(`text=${method}`).click();
    }

    async completeOrder() {
        await this.page.locator('button:has-text("Confirmar Pedido")').click();
    }

    async verifySuccess() {
        await expect(this.page.locator('text=Pedido Realizado com Sucesso')).toBeVisible();
    }
}
