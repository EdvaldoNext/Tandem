<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conexão P2P - Supabase</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      background: #0f0f1a; 
      color: white; 
      min-height: 100vh;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      text-align: center; 
      margin-bottom: 25px; 
      padding: 15px;
      background: #16213e;
      border-radius: 12px;
    }

    .room-box {
      background: #1a1a2e;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .room-box input {
      padding: 12px 15px;
      border-radius: 8px;
      border: none;
      width: 280px;
      font-size: 16px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 15px;
      transition: 0.2s;
    }
    .btn-primary { background: #00bfff; color: white; }
    .btn-primary:hover { background: #0099cc; }
    .btn-danger { background: #ff4444; color: white; }
    .btn-danger:hover { background: #cc0000; }
    #linkCompartilhar {
      margin-top: 12px;
      color: #00bfff;
      word-break: break-all;
      font-size: 14px;
      display: none;
      background: #16213e;
      padding: 10px;
      border-radius: 6px;
    }

    .video-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    @media (max-width: 768px) {
      .video-grid { grid-template-columns: 1fr; }
    }
    .video-container {
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      min-height: 200px;
    }
    .video-container p {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      padding: 5px 10px;
      border-radius: 6px;
      z-index: 2;
    }
    video {
      width: 100%;
      height: auto;
      display: block;
      background: #222;
    }
    #localVideo { transform: scaleX(-1); }

    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin: 15px 0;
    }

    .chat-area {
      background: #1a1a2e;
      border-radius: 12px;
      height: 320px;
      overflow-y: auto;
      padding: 15px;
      margin: 15px 0;
    }
    .message {
      margin: 8px 0;
      padding: 10px 14px;
      border-radius: 8px;
      max-width: 80%;
      line-height: 1.4;
    }
    .me {
      background: #00bfff;
      margin-left: auto;
      text-align: right;
    }
    .them {
      background: #33334d;
      margin-right: auto;
    }
    .chat-input-area {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .chat-input-area input {
      flex: 1;
      padding: 12px 15px;
      border-radius: 8px;
      border: none;
      font-size: 16px;
    }

    .status {
      text-align: center;
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 16px;
      font-weight: bold;
    }
    .conectado { background: #2ecc71; }
    .desconectado { background: #e74c3c; }
    .conectando { background: #f39c12; }
    
    .log-area {
      background: #222;
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 8px;
      height: 100px;
      overflow-y: auto;
      margin: 10px 0;
    }
  </style>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔗 Conexão P2P - cursor</h1>
      <p>Áudio • Vídeo • Texto | Servidor Próprio e Estável</p>
    </div>

    <div class="room-box">
      <h2>Entrar ou Criar Sala</h2>
      <input type="text" id="roomCode" placeholder="Código da Sala">
      <br>
      <button onclick="criarSala()" class="btn-primary">➕ Gerar Código</button>
      <button onclick="entrarSala()" class="btn-primary">🚪 Entrar</button>
      <div id="linkCompartilhar">🔗 Link para enviar: <span id="linkTexto"></span></div>
    </div>

    <div id="statusConexao" class="status desconectado">Aguardando código...</div>

    <div class="log-area" id="logTela">LOG DE SISTEMA:<br></div>

    <div class="video-grid">
      <div class="video-container">
        <p>Você</p>
        <video id="localVideo" autoplay playsinline muted></video>
      </div>
      <div class="video-container">
        <p>Parceiro</p>
        <video id="remoteVideo" autoplay playsinline></video>
      </div>
    </div>

    <div class="controls">
      <button id="btnAudio" onclick="alternarAudio()" class="btn-primary">🎤 Áudio: ON</button>
      <button id="btnVideo" onclick="alternarVideo()" class="btn-primary">📹 Vídeo: ON</button>
      <button onclick="desligarChamada()" class="btn-danger">📴 Desligar</button>
    </div>

    <div class="chat-area" id="mensagensChat"></div>
    <div class="chat-input-area">
      <input type="text" id="textoMensagem" placeholder="Digite sua mensagem..." onkeypress="if(event.key === 'Enter') enviarMensagem()">
      <button onclick="enviarMensagem()" class="btn-primary">Enviar</button>
    </div>
  </div>

  <script>
    const SUPABASE_URL = "https://xxmsrrekhtuvtpulkfwu.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXNycmVraHR1dnRwdWxrZnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTc2NTQsImV4cCI6MjA5NTQ5MzY1NH0.H7-Kn0FZ_W2gOrqsuClXV1-BkQywj8rXBavSg9I7R4Q";

    const PEER_ID = crypto.randomUUID();
    let localStream;
    let conexaoP2P;
    let canalDados;
    let codigoSala = "";
    let souCriador = false;
    let supabaseClient;
    let canalTempoReal;
    let negociando = false;
    let descricaoRemotaDefinida = false;
    const candidatosPendentes = [];

    const configuracao = {
      iceCandidatePoolSize: 10,
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
          urls: [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:443?transport=tcp"
          ],
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    };

    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");
    const statusTexto = document.getElementById("statusConexao");
    const logTela = document.getElementById("logTela");

    function adicionarLog(texto) {
      logTela.innerHTML += "> " + texto + "<br>";
      logTela.scrollTop = logTela.scrollHeight;
    }

    function atualizarStatus(texto, classe) {
      statusTexto.innerText = texto;
      statusTexto.className = "status " + classe;
    }

    window.onload = () => {
      adicionarLog("Sistema iniciado (peer: " + PEER_ID.slice(0, 8) + "...)");

      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      adicionarLog("Conectado ao Supabase");

      const parametroUrl = new URLSearchParams(window.location.search);
      if (parametroUrl.get("sala")) {
        codigoSala = parametroUrl.get("sala");
        document.getElementById("roomCode").value = codigoSala;
        adicionarLog("Entrando automaticamente: " + codigoSala);
        entrarSala();
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      }
    };

    async function iniciarMidia() {
      try {
        adicionarLog("Solicitando câmera e microfone...");
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localVideo.srcObject = localStream;
        adicionarLog("Midia local OK");
      } catch (erro) {
        adicionarLog("Erro midia: " + erro.message + " (continuando sem camera)");
      }
    }

    async function criarSala() {
      codigoSala = "sala-" + Math.random().toString(36).substr(2, 9);
      document.getElementById("roomCode").value = codigoSala;
      souCriador = true;

      const linkCompleto = `${window.location.origin}${window.location.pathname}?sala=${codigoSala}`;
      document.getElementById("linkTexto").innerText = linkCompleto;
      document.getElementById("linkCompartilhar").style.display = "block";

      adicionarLog("Sala criada: " + codigoSala);
      atualizarStatus("Sala criada - aguardando parceiro...", "conectando");

      await iniciarMidia();
      await iniciarCanalTempoReal();
    }

    async function entrarSala() {
      codigoSala = document.getElementById("roomCode").value.trim();
      if (!codigoSala) return alert("Digite um codigo de sala!");

      souCriador = false;
      adicionarLog("Entrando na sala: " + codigoSala);
      atualizarStatus("Conectando a sala...", "conectando");

      await iniciarMidia();
      await iniciarCanalTempoReal();
    }

    async function iniciarCanalTempoReal() {
      if (!codigoSala) return;

      if (canalTempoReal) {
        await supabaseClient.removeChannel(canalTempoReal);
        canalTempoReal = null;
      }

      canalTempoReal = supabaseClient.channel("sala:" + codigoSala, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: PEER_ID }
        }
      });

      canalTempoReal
        .on("broadcast", { event: "dados" }, (payload) => {
          processarSinal(payload.payload).catch((e) => {
            adicionarLog("Erro sinal: " + e.message);
          });
        })
        .on("presence", { event: "sync" }, () => {
          const usuarios = Object.keys(canalTempoReal.presenceState());
          adicionarLog("Usuarios na sala: " + usuarios.length);
          if (souCriador && usuarios.length >= 2) {
            iniciarNegociacao();
          }
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            adicionarLog("Canal Supabase conectado");
            await canalTempoReal.track({ role: souCriador ? "host" : "guest" });
            if (!souCriador) {
              await enviarDados({ tipo: "join", de: PEER_ID });
            }
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            adicionarLog("Erro no canal Supabase: " + status);
            atualizarStatus("Erro ao conectar sala", "desconectado");
          }
        });
    }

    async function enviarDados(dados) {
      if (!canalTempoReal) return;
      const status = await canalTempoReal.send({
        type: "broadcast",
        event: "dados",
        payload: dados
      });
      if (status !== "ok") {
        adicionarLog("Falha ao enviar sinal: " + status);
      }
    }

    async function processarSinal(dados) {
      if (!dados || dados.de === PEER_ID) return;

      adicionarLog("Recebido: " + (dados.tipo || "candidate"));

      if (dados.tipo === "join" && souCriador) {
        await iniciarNegociacao();
        return;
      }

      await garantirConexaoP2P();

      if (dados.tipo === "oferta") {
        await conexaoP2P.setRemoteDescription(new RTCSessionDescription(dados.sdp));
        descricaoRemotaDefinida = true;
        await processarCandidatosPendentes();

        const resposta = await conexaoP2P.createAnswer();
        await conexaoP2P.setLocalDescription(resposta);
        await enviarDados({
          tipo: "resposta",
          de: PEER_ID,
          sdp: { type: resposta.type, sdp: resposta.sdp }
        });
        return;
      }

      if (dados.tipo === "resposta") {
        await conexaoP2P.setRemoteDescription(new RTCSessionDescription(dados.sdp));
        descricaoRemotaDefinida = true;
        await processarCandidatosPendentes();
        return;
      }

      if (dados.tipo === "candidate" && dados.candidate) {
        const candidato = new RTCIceCandidate(dados.candidate);
        if (descricaoRemotaDefinida && conexaoP2P.remoteDescription) {
          await conexaoP2P.addIceCandidate(candidato);
        } else {
          candidatosPendentes.push(candidato);
        }
      }
    }

    async function processarCandidatosPendentes() {
      while (candidatosPendentes.length) {
        const candidato = candidatosPendentes.shift();
        try {
          await conexaoP2P.addIceCandidate(candidato);
        } catch (e) {
          adicionarLog("Candidato ICE ignorado: " + e.message);
        }
      }
    }

    async function garantirConexaoP2P() {
      if (conexaoP2P) return;

      adicionarLog("Criando conexao P2P...");
      conexaoP2P = new RTCPeerConnection(configuracao);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          conexaoP2P.addTrack(track, localStream);
        });
      } else {
        conexaoP2P.addTransceiver("video", { direction: "sendrecv" });
        conexaoP2P.addTransceiver("audio", { direction: "sendrecv" });
      }

      conexaoP2P.ontrack = (e) => {
        if (e.streams && e.streams[0]) {
          remoteVideo.srcObject = e.streams[0];
        }
      };

      conexaoP2P.onicecandidate = (e) => {
        if (e.candidate) {
          enviarDados({
            tipo: "candidate",
            de: PEER_ID,
            candidate: e.candidate.toJSON()
          });
        }
      };

      conexaoP2P.oniceconnectionstatechange = () => {
        adicionarLog("ICE: " + conexaoP2P.iceConnectionState);
        if (conexaoP2P.iceConnectionState === "connected" || conexaoP2P.iceConnectionState === "completed") {
          atualizarStatus("CONECTADO!", "conectado");
        } else if (conexaoP2P.iceConnectionState === "failed") {
          atualizarStatus("Falha na conexao P2P - tente novamente", "desconectado");
        } else if (conexaoP2P.iceConnectionState === "disconnected") {
          atualizarStatus("Conexao instavel...", "conectando");
        }
      };

      conexaoP2P.onconnectionstatechange = () => {
        adicionarLog("P2P: " + conexaoP2P.connectionState);
      };

      if (souCriador) {
        canalDados = conexaoP2P.createDataChannel("chat");
        configurarCanalTexto();
      } else {
        conexaoP2P.ondatachannel = (e) => {
          canalDados = e.channel;
          configurarCanalTexto();
        };
      }
    }

    async function iniciarNegociacao() {
      if (!souCriador || negociando) return;
      negociando = true;

      try {
        await garantirConexaoP2P();
        adicionarLog("Enviando oferta WebRTC...");
        const offer = await conexaoP2P.createOffer();
        await conexaoP2P.setLocalDescription(offer);
        await enviarDados({
          tipo: "oferta",
          de: PEER_ID,
          sdp: { type: offer.type, sdp: offer.sdp }
        });
      } catch (e) {
        negociando = false;
        adicionarLog("Erro ao negociar: " + e.message);
      }
    }

    function configurarCanalTexto() {
      if (!canalDados) return;
      canalDados.onopen = () => adicionarLog("Chat aberto!");
      canalDados.onmessage = (e) => adicionarMensagemTela("them", e.data);
    }

    function enviarMensagem() {
      if (!canalDados || canalDados.readyState !== "open") return alert("Chat nao conectado");
      const input = document.getElementById("textoMensagem");
      const texto = input.value.trim();
      if (texto) {
        canalDados.send(texto);
        adicionarMensagemTela("me", texto);
        input.value = "";
      }
    }

    function adicionarMensagemTela(tipo, texto) {
      const chat = document.getElementById("mensagensChat");
      const div = document.createElement("div");
      div.className = "message " + tipo;
      div.innerHTML = "<strong>" + (tipo === "me" ? "Voce" : "Parceiro") + ":</strong> " + texto;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    function alternarAudio() {
      if (!localStream) return;
      const track = localStream.getAudioTracks()[0];
      if (!track) return;
      track.enabled = !track.enabled;
      document.getElementById("btnAudio").innerText = track.enabled ? "Audio: ON" : "Audio: OFF";
    }

    function alternarVideo() {
      if (!localStream) return;
      const track = localStream.getVideoTracks()[0];
      if (!track) return;
      track.enabled = !track.enabled;
      document.getElementById("btnVideo").innerText = track.enabled ? "Video: ON" : "Video: OFF";
    }

    function desligarChamada() {
      if (conexaoP2P) conexaoP2P.close();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (canalTempoReal) supabaseClient.removeChannel(canalTempoReal);
      location.reload();
    }
  </script>
</body>
</html>



-----------------------------------------------
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