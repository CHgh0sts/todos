const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

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
      origin: `http://${hostname}:${port}`,
      methods: ['GET', 'POST']
    }
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
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté: ${socket.userName}`)
    })
  })

  // Exposer l'instance io globalement pour l'utiliser dans les API routes
  global.io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 Serveur prêt sur http://${hostname}:${port}`)
      console.log(`🔌 Socket.IO activé`)
    })
}) 