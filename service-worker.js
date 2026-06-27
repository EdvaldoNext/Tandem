// service-worker.js
// Funciona em segundo plano, como um funcionário que trabalha mesmo com a loja fechada

// 📢 Escuta quando o Sistema Operacional (Android/iOS) manda um aviso
self.addEventListener('push', (evento) => {
  
  const opcoesNotificacao = {
    body: 'Seu amigo está te chamando! 📞',
    icon: 'https://cdn-icons-png.flaticon.com/512/1059/1059177.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/1059/1059177.png',
    
    // 🔊 FAZ TOCAR E VIBRAR IGUAL UMA LIGAÇÃO REAL
    sound: 'default', 
    vibrate: [300, 150, 300, 150, 300, 150, 400], // Padrão de vibração
    renotify: true,
    tag: 'chamada-recebida', // Agrupa notificações da mesma chamada

    // 📍 Dados para saber qual sala abrir ao clicar
    data: {
      url: self.location.origin // O endereço do seu site
    }
  };

  // Mostra na tela de bloqueio e barra de notificações
  evento.waitUntil(
    self.registration.showNotification('📞 Chamada P2P', opcoesNotificacao)
  );
});

// 🖱️ O que acontece quando o usuário CLICA na notificação
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close(); // Fecha o aviso

  // ✅ ABRE O SITE E JÁ DIRECIONA PARA A SALA CORRETA
  // Pega o código da sala salvo no armazenamento
  evento.waitUntil(
    clients.openWindow(`${evento.notification.data.url}?sala=${localStorage.getItem('salaAtual') || ''}`)
  );
});

// Armazenamento local dentro do Service Worker
// (simulamos aqui pois o SW tem escopo próprio)
var localStorage = {
  getItem: function(chave) { return this[chave] || null; },
  setItem: function(chave, valor) { this[chave] = valor; }
};