import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { cart } from '@wix/ecom';
import { members } from '@wix/members'; // Adicionado para suporte a membros

/**
 * CONFIGURAÇÃO DO WIX CLIENT
 * modules: Define quais APIs do Wix você terá acesso.
 */
export const wixClient = createClient({
  modules: {
    products,
    collections,
    cart, 
    members, // Adicionado aos módulos
  },
  auth: OAuthStrategy({
    clientId: import.meta.env.VITE_WIX_CLIENT_ID, // Substitua pelo seu Client ID do Wix Headless
    tokens: JSON.parse(localStorage.getItem('wix_tokens') || '{}'),
  }),
});

/**
 * BUSCA STATUS DO MEMBRO (Solicitado pelo Header)
 * Retorna os dados do perfil do usuário logado.
 */
export const checkMemberStatus = async () => {
  try {
    // Se não houver tokens ou sessão, retorna null sem dar erro
    if (!wixClient.auth.loggedIn()) return null;
    
    const { member } = await wixClient.members.getCurrentMember({
      fieldsets: ['FULL']
    });
    return member || null;
  } catch (error) {
    console.error("Erro ao buscar status do membro:", error);
    return null;
  }
};

/**
 * Função utilitária para buscar tokens de visitante caso não existam,
 * evitando erros de permissão ao carregar o carrinho ou produtos.
 */
export const getWixTokens = async () => {
  if (localStorage.getItem('wix_tokens')) {
    const tokens = JSON.parse(localStorage.getItem('wix_tokens'));
    wixClient.auth.setTokens(tokens);
    return tokens;
  }

  try {
    const tokens = await wixClient.auth.generateVisitorTokens();
    localStorage.setItem('wix_tokens', JSON.stringify(tokens));
    wixClient.auth.setTokens(tokens);
    return tokens;
  } catch (error) {
    console.error("Erro ao gerar tokens:", error);
    return null;
  }
};

/**
 * LOGIN SEM SENHA (Passwordless)
 * Envia um link de acesso para o e-mail no Wix Headless.
 */
export const loginWithEmail = async (email) => {
  return await wixClient.auth.sendPasswordlessLogonLink(email, window.location.origin);
};

/**
 * LOGOUT
 * Limpa tokens e redireciona para a URL de logout do Wix.
 */
export const logout = async () => {
  try {
    const { logoutUrl } = await wixClient.auth.logout(window.location.origin);
    localStorage.removeItem('wix_tokens');
    window.location.href = logoutUrl;
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  }
};

/**
 * Função utilitária para verificar se o usuário está logado
 */
export const isLoggedIn = () => {
  const tokens = JSON.parse(localStorage.getItem('wix_tokens') || '{}');
  return tokens.refreshToken && wixClient.auth.loggedIn(); // Corrigido lógica de verificação
};

