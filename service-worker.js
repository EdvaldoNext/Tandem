self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch (_) {
    dados = {};
  }

  const sala = dados.sala || "";
  const opcoes = {
    body: "Alguem esta te chamando! Toque para atender.",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [300, 150, 300, 150, 300, 150, 400],
    renotify: true,
    tag: "chamada-recebida",
    requireInteraction: true,
    data: { sala },
    actions: [
      { action: "atender", title: "Atender" },
      { action: "recusar", title: "Recusar" }
    ]
  };

  event.waitUntil(self.registration.showNotification("Chamada Tandem", opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "recusar") return;

  const sala = event.notification.data?.sala || "";
  const url = self.registration.scope + (sala ? "?sala=" + sala : "");

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const client of lista) {
        if (client.url.startsWith(self.registration.scope) && "focus" in client) {
          if (sala) client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
