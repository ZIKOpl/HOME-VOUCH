// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ajoute CECI pour que le site marche :
app.use(express.static('public'));

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur DB:', err));

// --- MODÈLES ---
// Assure-toi que tu as bien un dossier "models" avec tes fichiers (Config.js, Vouch.js, etc.)
const Config = require('./models/Config');
const Vouch = require('./models/Vouch');
const Vendeur = require('./models/Vendeur');
const Item = require('./models/Item');
const Paiement = require('./models/Paiement');

// --- ROUTE AUTHENTIFICATION (LOGIN) ---
app.post('/api/auth/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ authorized: false, error: "Token manquant" });

    try {
        // 1. Récupérer l'utilisateur
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = userRes.data;

        // 2. Récupérer les serveurs de l'utilisateur
        const guildsRes = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 3. Chercher TON serveur dans sa liste
        const guild = guildsRes.data.find(g => g.id === process.env.GUILD_ID);

        if (!guild) {
            return res.status(403).json({ authorized: false, error: "Tu n'es pas sur le serveur requis." });
        }

        // 4. Vérifier si l'utilisateur est ADMINISTRATEUR (Permission 0x8)
        const isAdmin = (guild.permissions & 0x8) === 0x8;

        if (isAdmin) {
            // SUCCÈS
            return res.json({
                authorized: true,
                username: user.username,
                avatar: user.avatar 
                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`
            });
        } else {
            // ÉCHEC
            return res.status(403).json({ authorized: false, error: "Tu n'as pas la permission Administrateur sur le serveur." });
        }

    } catch (error) {
        console.error("Erreur Discord Auth:", error.message);
        res.status(500).json({ authorized: false, error: "Erreur serveur Discord" });
    }
});

// --- ROUTES API (CRUD) ---
// Les données sont filtrées automatiquement par GUILD_ID (défini dans .env)

// 1. VOUCHE
app.get('/api/vouches', async (req, res) => {
    const vouches = await Vouch.find({ guildId: process.env.GUILD_ID }).sort({ createdAt: -1 });
    res.json(vouches);
});

app.post('/api/vouches', async (req, res) => {
    const lastVouch = await Vouch.findOne({ guildId: process.env.GUILD_ID }).sort({ vouchId: -1 });
    const nextId = lastVouch ? lastVouch.vouchId + 1 : 1;
    
    const newVouch = new Vouch({
        ...req.body,
        guildId: process.env.GUILD_ID, // Force l'ID du serveur
        vouchId: nextId,
        createdAt: new Date()
    });
    await newVouch.save();
    res.json(newVouch);
});

app.delete('/api/vouches/:id', async (req, res) => {
    await Vouch.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 2. VENDEURS
app.get('/api/vendeurs', async (req, res) => {
    const vendeurs = await Vendeur.find({ guildId: process.env.GUILD_ID });
    res.json(vendeurs);
});

app.post('/api/vendeurs', async (req, res) => {
    const newV = new Vendeur({ ...req.body, guildId: process.env.GUILD_ID });
    await newV.save();
    res.json(newV);
});

app.delete('/api/vendeurs/:id', async (req, res) => {
    await Vendeur.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 3. ITEMS
app.get('/api/items', async (req, res) => {
    const items = await Item.find({ guildId: process.env.GUILD_ID });
    res.json(items);
});

app.post('/api/items', async (req, res) => {
    const newI = new Item({ ...req.body, guildId: process.env.GUILD_ID });
    await newI.save();
    res.json(newI);
});

app.delete('/api/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 4. PAIEMENTS
app.get('/api/paiements', async (req, res) => {
    const paiements = await Paiement.find({ guildId: process.env.GUILD_ID });
    res.json(paiements);
});

app.post('/api/paiements', async (req, res) => {
    const newP = new Paiement({ ...req.body, guildId: process.env.GUILD_ID });
    await newP.save();
    res.json(newP);
});

app.delete('/api/paiements/:id', async (req, res) => {
    await Paiement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// 5. CONFIG
app.get('/api/config', async (req, res) => {
    const config = await Config.findOne({ guildId: process.env.GUILD_ID });
    res.json(config || {});
});

app.put('/api/config', async (req, res) => {
    const config = await Config.findOneAndUpdate(
        { guildId: process.env.GUILD_ID },
        req.body,
        { new: true, upsert: true }
    );
    res.json(config);
});

app.listen(process.env.PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${process.env.PORT}`);
    console.log(`🔐 Mode Admin: Oui (nécessite permission 0x8 sur le serveur ${process.env.GUILD_ID})`);
});