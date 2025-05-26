export default function Contact() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contact</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Une question, un bug, une suggestion ? Contactez l'équipe CollabWave !</p>
        <form className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold dark:text-white">Votre email</label>
            <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold dark:text-white">Message</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" rows={5} required></textarea>
          </div>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">Envoyer</button>
        </form>
      </div>
    </div>
  )
} 