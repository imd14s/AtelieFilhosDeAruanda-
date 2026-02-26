import { test, expect } from '@playwright/test';
import { StorefrontPage } from '../pages/StorefrontPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AdminPage } from '../pages/AdminPage';

test.describe('Sales Lifecycle E2E', () => {
    test('should complete a sale and verify NF-e in admin dashboard', async ({ page }) => {
        const storefront = new StorefrontPage(page);
        const checkout = new CheckoutPage(page);
        const admin = new AdminPage(page);

        // 1. Storefront Flow
        await storefront.goto();
        await storefront.searchProduct('Camiseta');
        await storefront.addFirstProductToCart();
        await storefront.openCart();
        await storefront.goToCheckout();

        // 2. Checkout Flow
        await checkout.fillFiscalData(
            'Teste Automatizado',
            '12345678909',
            'qa@atelie.com'
        );
        await checkout.fillAddress('01001-000', '100');
        await checkout.selectPaymentMethod('PIX');
        await checkout.completeOrder();
        await checkout.verifySuccess();

        // 3. Admin Verification Flow
        // Note: Admin login usually requires credentials from .env or seed
        await admin.login('admin@atelie.com', 'admin123');
        await admin.goToOrders();
        await admin.verifyLastOrderAuthorized();

        const nfe = await admin.downloadNFe();
        expect(nfe.suggestedFilename()).toContain('nfe');
    });
});
