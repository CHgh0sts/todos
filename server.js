const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Fonction pour obtenir l'IP locale
const getLocalIP = () => {
  const { networkInterfaces } = require('os')
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ignorer les adresses non-IPv4 et les adresses de loopback
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

// Configuration des origines autorisées pour CORS
const allowedOrigins = dev 
  ? [
      `http://localhost:${port}`, 
      `http://127.0.0.1:${port}`,
      `http://${localIP}:${port}`,
      // Permettre toutes les IPs du réseau local pour le développement
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:3000$/
    ]
  : [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      'https://todo.chghosts.fr',
      'https://www.todo.chghosts.fr'
    ].filter(Boolean)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Configuration pour la production
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Middleware d'authentification Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Token manquant'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      socket.userName = decoded.name
      next()
    } catch (err) {
      next(new Error('Token invalide'))
    }
  })

  // Gestion des connexions Socket.IO
  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur connecté: ${socket.userName} (ID: ${socket.userId})`)

    // Rejoindre la salle de l'utilisateur pour les notifications personnelles
    socket.join(`user_${socket.userId}`)

    // Rejoindre une salle de projet
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`)
      console.log(`📋 ${socket.userName} a rejoint le projet ${projectId}`)
    })

    // Quitter une salle de projet
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`)
      console.log(`📋 ${socket.userName} a quitté le projet ${projectId}`)
    })

    // Déconnexion
    socket.on('disconnect', (reason) => {
      console.log(`❌ Utilisateur déconnecté: ${socket.userName} (Raison: ${reason})`)
    })

    // Gestion des erreurs
    socket.on('error', (error) => {
      console.error(`🚨 Erreur Socket pour ${socket.userName}:`, error)
    })
  })

  // Exposer l'instance io globalement pour l'utiliser dans les API routes
  global.io = io

  httpServer
    .once('error', (err) => {
      console.error('❌ Erreur serveur:', err)
      process.exit(1)
    })
    .listen(port, hostname, () => {
      console.log(`🚀 Serveur prêt sur http://${hostname}:${port}`)
      console.log(`🏠 Accès local: http://localhost:${port}`)
      console.log(`🌐 Accès réseau: http://${localIP}:${port}`)
      console.log(`🔌 Socket.IO activé`)
      console.log(`🌍 Origines autorisées:`, allowedOrigins.filter(origin => typeof origin === 'string'))
      console.log(`📦 Mode:`, dev ? 'développement' : 'production')
      
      if (dev) {
        console.log(`\n📱 Pour accéder depuis un autre appareil sur le réseau:`)
        console.log(`   • Assurez-vous que votre firewall autorise le port ${port}`)
        console.log(`   • Utilisez l'adresse: http://${localIP}:${port}`)
        console.log(`   • Ou scannez ce QR code avec votre téléphone`)
      }
    })
}) 