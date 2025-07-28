const Router = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { URL } = require('url')
const userMiddleware = require('../middlewares/userMiddleware')
const { User, Bookmark } = require('../db/index')

const router = Router()

router.get('/save-bookmark', userMiddleware,async (req,res) => {
    const url = req.query.url    
    try {
        const response = await axios.get(url)
        const html = await response.data

        const $ = cheerio.load(html)        

        const title = $('title').text() || 'No Title Found'

        let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico'

        const baseUrl = new URL(url)
        favicon = new URL(favicon, baseUrl).href
        var summary = ""
        try {
          const response = await axios.get(`https://r.jina.ai/${url}`)
          const index = response.data.search("Markdown Content:") 
          summary = response.data.slice(index + 17, index + 17 + 50)
        }
        catch (err) {
          console.error('Error fetching website info:', err.message)
        }

        try {
          const user = await User.findOne({email: req.email})
          const bookmark = new Bookmark({
            userId: user._id,
            url: url,
            title: title,
            favicon: favicon,
            summary: summary == "" ? 'No summary available' : summary
          })
          await bookmark.save()
        }
        catch (err) {
          console.error('Error saving bookmark:', err.message)
          return res.status(500).json({ message: 'Error saving bookmark' })
        }
        return res.status(200).send("Bookmark saved successfully")
    } 
    catch (err) {
        console.error('Error fetching website info:', err.message)
        return res.status(500).json( { title: null, favicon: null })
    }
})

router.get('/get-bookmarks', userMiddleware, async (req,res) => {
    try {
        const user = await User.findOne({email: req.email})
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const bookmarks = await Bookmark.find({ userId: user._id })
        return res.status(200).json(bookmarks)
    } catch (err) {
        console.error('Error fetching bookmarks:', err.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/delete-bookmark/:id', userMiddleware, async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findOne({ email: req.email })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const bookmark = await Bookmark.findOneAndDelete({ _id: id, userId: user._id })
        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' })
        }
        return res.status(200).json({ message: 'Bookmark deleted successfully' })
    } catch (err) {
        console.error('Error deleting bookmark:', err.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router